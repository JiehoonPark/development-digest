/**
 * 오늘의 글을 로컬에서 미리 써 본다. 수집·이메일 없이, 지난 아카이브의 기사를 후보로 쓴다.
 *   npx tsx scripts/preview-post.ts [아카이브 날짜 YYYY-MM-DD]
 *
 * - 항상 DRY_RUN — 결과는 data/preview/posts, data/preview/covers 에만 쓴다(운영 글 목록과 섞이지 않음)
 * - 필요한 키: ANTHROPIC_API_KEY. 커버는 설치된 Chrome 으로 그린다(AI 이미지 생성 없음)
 * - 실제 AI 비용이 든다: 주제 선정·짧은 소식(Sonnet), 작성·수정(Opus), 사실 검증(Sonnet)
 */
import "dotenv/config";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { getArchiveDir, type ArchiveData } from "../src/data/digest-archiver.js";
import type { PostCandidate } from "../src/post/index.js";

process.env.DRY_RUN = "true";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY 가 없습니다. 저장소 루트 .env 에 넣어 주세요(.gitignore 대상).");
  process.exit(1);
}

const archiveDir = getArchiveDir();
const requested = process.argv[2];
const archiveFile = requested
  ? `${requested}.json`
  : readdirSync(archiveDir).filter((name) => name.endsWith(".json")).sort().at(-1);
if (!archiveFile || !existsSync(join(archiveDir, archiveFile))) {
  console.error(`아카이브가 없습니다: ${archiveDir}/${archiveFile ?? "(비어 있음)"}`);
  process.exit(1);
}

const archive = JSON.parse(readFileSync(join(archiveDir, archiveFile), "utf8")) as ArchiveData;
const candidates: PostCandidate[] = archive.sections.flatMap((section) =>
  section.items.map((item) => ({
    url: item.url,
    title: item.title,
    titleKo: item.titleKo,
    sourceName: item.sourceName,
    publishedAt: item.publishedAt,
    contentType: item.contentType,
    labels: item.labels ?? [],
    relevance: item.relevance ?? 50,
    summary: item.summary,
    fullContent: item.fullContent,
  }))
);

// 모듈이 DRY_RUN 을 읽은 뒤에 불러오도록 동적 import
const { runPostPipeline } = await import("../src/post/index.js");

console.log(`후보 ${candidates.length}건 (${archiveFile})으로 오늘의 글을 씁니다…`);
const started = Date.now();
const result = await runPostPipeline(candidates);
console.log(JSON.stringify(result, null, 2));
console.log(`소요 ${Math.round((Date.now() - started) / 1000)}초`);
