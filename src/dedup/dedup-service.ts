import { isUrlSeen, markUrlsBatch } from "../db/repositories/seen-urls.js";
import { createChildLogger } from "../utils/logger.js";
import type { CollectedItem } from "../collectors/types.js";

const log = createChildLogger("dedup");

export function dedup(items: CollectedItem[]): CollectedItem[] {
  const seen = new Set<string>();
  const result: CollectedItem[] = [];

  for (const item of items) {
    const normalizedUrl = normalizeUrl(item.url);

    if (seen.has(normalizedUrl)) continue;
    if (isUrlSeen(normalizedUrl)) continue;

    seen.add(normalizedUrl);
    result.push(item);
  }

  log.info(
    { before: items.length, after: result.length, removed: items.length - result.length },
    "중복 제거 완료"
  );

  return result;
}

export function markAsSeen(items: CollectedItem[]): void {
  markUrlsBatch(
    items.map((item) => ({
      url: normalizeUrl(item.url),
      title: item.title,
      sourceId: item.sourceId,
    }))
  );
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("ref");
    return u.toString().replace(/\/+$/, "");
  } catch {
    return url;
  }
}
