import pMap from "p-map";
import type { ScoredItem } from "../prioritizer/scoring.js";
import { extractArticle } from "./article-extractor.js";
import { extractYoutubeTranscript } from "./youtube-transcript.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("content-enricher");

const ENRICHMENT_LIMIT = 25;
const CONCURRENCY = 3;

export async function enrichWithContent(items: ScoredItem[]): Promise<ScoredItem[]> {
  const toEnrich = items.slice(0, ENRICHMENT_LIMIT);
  const rest = items.slice(ENRICHMENT_LIMIT);

  let successCount = 0;
  let failCount = 0;

  const enriched = await pMap(
    toEnrich,
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

  const skipped = rest.map((item) => ({ ...item, extractionStatus: "skipped" as const }));

  log.info(
    { total: toEnrich.length, success: successCount, failed: failCount, skipped: rest.length },
    "본문 추출 완료"
  );

  return [...enriched, ...skipped];
}
