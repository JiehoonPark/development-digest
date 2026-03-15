import "dotenv/config";
import pMap from "p-map";
import { allSources } from "../config/sources/index.js";
import { createCollector } from "../src/collectors/index.js";
import type { CollectedItem } from "../src/collectors/types.js";
import { dedup } from "../src/dedup/dedup-service.js";
import { prioritize } from "../src/prioritizer/prioritizer.js";
import { initDb, cleanExpiredUrls, closeDb } from "../src/db/database.js";
import { RateLimiter } from "../src/utils/rate-limiter.js";

const rateLimiters: Record<string, RateLimiter> = {
  rss: new RateLimiter(10, 100),
  hackernews: new RateLimiter(3, 500),
  reddit: new RateLimiter(1, 1000),
  youtube: new RateLimiter(5, 200),
  "github-trending": new RateLimiter(1, 2000),
};

async function main() {
  console.log("=== Dev Digest 파이프라인 테스트 (AI 없이) ===\n");

  // DB 초기화
  initDb();
  cleanExpiredUrls();
  console.log("✅ DB 초기화 완료\n");

  // 수집
  console.log(`📡 ${allSources.length}개 소스에서 수집 시작...`);
  const allItems: CollectedItem[] = [];
  const errors: string[] = [];

  const grouped: Record<string, typeof allSources> = {};
  for (const source of allSources) {
    if (!grouped[source.type]) grouped[source.type] = [];
    grouped[source.type].push(source);
  }

  for (const [type, sources] of Object.entries(grouped)) {
    const limiter = rateLimiters[type] ?? rateLimiters.rss;
    const results = await pMap(
      sources,
      async (source) => {
        return limiter.execute(async () => {
          const collector = createCollector(source);
          return collector.collect();
        });
      },
      { concurrency: 5 }
    );

    for (const result of results) {
      if (result.error) {
        errors.push(`${result.sourceId}: ${result.error}`);
      } else {
        allItems.push(...result.items);
      }
    }
  }

  console.log(`✅ 수집 완료: ${allItems.length}개 항목 (${errors.length}개 소스 실패)\n`);

  if (errors.length > 0) {
    console.log("⚠️  실패한 소스:");
    for (const err of errors) {
      console.log(`   - ${err}`);
    }
    console.log("");
  }

  // 중복 제거
  const unique = dedup(allItems);
  console.log(`🔄 중복 제거: ${allItems.length} → ${unique.length}개\n`);

  // 우선순위
  const top = prioritize(unique);
  console.log("📊 상위 20개 (점수순):\n");

  for (let i = 0; i < Math.min(20, top.length); i++) {
    const item = top[i];
    const engBadge = item.engagement ? ` [⬆${item.engagement}]` : "";
    console.log(`  ${String(i + 1).padStart(2)}. [${item.score}점] ${item.title}${engBadge}`);
    console.log(`      via ${item.sourceName} | ${item.language} | ${item.contentType}`);
    console.log(`      ${item.url}\n`);
  }

  // 카테고리별 통계
  const catStats: Record<string, number> = {};
  for (const item of unique) {
    catStats[item.category] = (catStats[item.category] ?? 0) + 1;
  }
  console.log("📈 카테고리별 수집 통계:");
  for (const [cat, count] of Object.entries(catStats).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${cat}: ${count}개`);
  }

  closeDb();
  console.log("\n✅ 테스트 완료!");
}

main().catch(console.error);
