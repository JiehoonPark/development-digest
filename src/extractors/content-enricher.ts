import pMap from "p-map";
import type { ScoredItem } from "../prioritizer/scoring.js";
import { extractArticle } from "./article-extractor.js";
import { extractYoutubeTranscript } from "./youtube-transcript.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("content-enricher");

const CONCURRENCY = 3;

/** 입력은 이미 분류·선별을 통과한 소수(≤15건) — 전 건 추출한다. */
export async function enrichWithContent<T extends ScoredItem>(items: T[]): Promise<T[]> {
  let successCount = 0;
  let failCount = 0;

  const enriched = await pMap(
    items,
    async (item) => {
      // GitHub repo는 description으로 충분
      if (item.contentType === "repo") {
        return { ...item, extractionStatus: "skipped" as const };
      }

      const result = item.contentType === "video"
        ? await extractYoutubeTranscript(item.url)
        : await extractArticle(item.url);

      if (result.status === "success" && result.content.length > 0) {
        successCount++;
        return {
          ...item,
          fullContent: result.content,
          extractionStatus: "success" as const,
        };
      }

      failCount++;
      return { ...item, extractionStatus: "failed" as const };
    },
    { concurrency: CONCURRENCY }
  );

  log.info(
    { total: items.length, success: successCount, failed: failCount },
    "본문 추출 완료"
  );

  return enriched;
}
