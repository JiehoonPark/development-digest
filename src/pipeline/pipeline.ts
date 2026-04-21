import pMap from "p-map";
import { allSources } from "../../config/sources/index.js";
import { createCollector } from "../collectors/index.js";
import type { CollectedItem, CollectorResult } from "../collectors/types.js";
import { dedup, markAsSeen } from "../dedup/dedup-service.js";
import { prioritize } from "../prioritizer/prioritizer.js";
import { processWithAI } from "../summarizer/batch-processor.js";
import { enrichWithContent } from "../extractors/content-enricher.js";
import { composeNewsletter } from "../composer/newsletter-composer.js";
import { sendDigestEmail } from "../email/email-sender.js";
import { initDb, cleanExpiredUrls, closeDb } from "../db/database.js";
import { recordSuccess, recordFailure } from "../db/repositories/source-health.js";
import { saveDigestHistory } from "../db/repositories/digest-history.js";
import { buildArchiveData, saveArchive } from "../data/digest-archiver.js";
import { translateArticles } from "../translator/article-translator.js";
import { generateMarkdown } from "../markdown/markdown-generator.js";
import { runStep } from "./step-runner.js";
import { createChildLogger } from "../utils/logger.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const log = createChildLogger("pipeline");
const __dirname = dirname(fileURLToPath(import.meta.url));

const isDryRun = process.env.DRY_RUN === "true";

// Rate limiters per source type
const rateLimiters: Record<string, RateLimiter> = {
  rss: new RateLimiter(10, 100),
  hackernews: new RateLimiter(3, 500),
  reddit: new RateLimiter(1, 1000),
  youtube: new RateLimiter(5, 200),
  "github-trending": new RateLimiter(1, 2000),
};

export async function runPipeline(): Promise<void> {
  const pipelineStart = Date.now();
  log.info({ sourceCount: allSources.length, isDryRun }, "파이프라인 시작");

  try {
    // 1. DB 초기화
    await runStep("DB 초기화", async () => {
      initDb();
      cleanExpiredUrls();
    });

    // 2. 수집
    const { allItems, healthWarnings } = await runStep("수집", async () => {
      const results = await collectAll();
      const items = results.flatMap((r) => r.items);
      const warnings = checkSourceHealth(results);
      if (warnings.length > 0) {
        log.warn({ warnings }, "소스 헬스 경고");
      }
      return { allItems: items, healthWarnings: warnings };
    });

    if (allItems.length === 0) {
      log.warn("수집된 항목이 없습니다. 파이프라인을 종료합니다.");
      return;
    }

    // 3. 중복 제거
    const uniqueItems = await runStep("중복 제거", async () => {
      return dedup(allItems);
    });

    // 4. 우선순위
    const prioritized = await runStep("우선순위 정렬", async () => {
      return prioritize(uniqueItems);
    });

    // 5. 본문 추출
    const enriched = await runStep("본문 추출", async () => {
      return enrichWithContent(prioritized);
    });

    // 6. AI 요약
    const digest = await runStep("AI 요약", async () => {
      return processWithAI(enriched);
    });

    // 6. HTML 구성
    const html = await runStep("뉴스레터 구성", async () => {
      return composeNewsletter(digest, { healthWarnings });
    });

    // 7. 발송 또는 로컬 저장
    if (isDryRun) {
      await runStep("로컬 저장 (DRY_RUN)", async () => {
        const outDir = join(__dirname, "../../data");
        mkdirSync(outDir, { recursive: true });
        const outPath = join(outDir, `digest-${new Date().toISOString().slice(0, 10)}.html`);
        writeFileSync(outPath, html);
        log.info({ path: outPath }, "HTML 파일 저장 완료");
      });
    } else {
      await runStep("이메일 발송", async () => {
        await sendDigestEmail(html);
      });
    }

    // 8. 데이터 보관 → 번역 → Markdown 생성
    //    (웹 HTML은 이 파이프라인 다음 `web/` Next.js 빌드가 책임짐)
    await runStep("데이터 보관", async () => {
      const archive = buildArchiveData(digest, enriched);
      saveArchive(archive);

      const translated = await translateArticles(archive);

      generateMarkdown(translated);
    });

    // 9. 이력 저장 + URL 마킹
    await runStep("이력 저장", async () => {
      markAsSeen(uniqueItems);
      const totalItems = digest.sections.reduce((acc, s) => acc + s.items.length, 0);
      saveDigestHistory({
        itemCount: totalItems,
        sectionsJson: JSON.stringify(digest.sections.map((s) => ({
          category: s.category,
          count: s.items.length,
        }))),
        recipients: process.env.DIGEST_RECIPIENTS ?? "",
        status: isDryRun ? "dry-run" : "sent",
      });
    });

    const elapsed = Date.now() - pipelineStart;
    log.info({ elapsed: `${elapsed}ms`, isDryRun }, "파이프라인 완료");
  } catch (error) {
    log.error({ error }, "파이프라인 실패");
    throw error;
  } finally {
    closeDb();
  }
}

async function collectAll(): Promise<CollectorResult[]> {
  const results: CollectorResult[] = [];

  const grouped = groupByType(allSources);

  for (const [type, sources] of Object.entries(grouped)) {
    const limiter = rateLimiters[type] ?? rateLimiters.rss;

    const typeResults = await pMap(
      sources,
      async (source) => {
        return limiter.execute(async () => {
          const collector = createCollector(source);
          const result = await collector.collect();

          if (result.error) {
            recordFailure(source.id);
          } else {
            recordSuccess(source.id, result.items.length);
          }

          return result;
        });
      },
      { concurrency: limiter["concurrency"] ?? 5 }
    );

    results.push(...typeResults);
  }

  const totalItems = results.reduce((acc, r) => acc + r.items.length, 0);
  const failedSources = results.filter((r) => r.error).length;
  log.info({ totalItems, failedSources, totalSources: allSources.length }, "전체 수집 완료");

  return results;
}

function checkSourceHealth(results: CollectorResult[]): string[] {
  return results
    .filter((r) => r.items.length === 0 && !r.error)
    .map((r) => `${r.sourceId} (0건)`);
}

function groupByType(sources: typeof allSources): Record<string, typeof allSources> {
  const groups: Record<string, typeof allSources> = {};
  for (const source of sources) {
    const type = source.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(source);
  }
  return groups;
}
