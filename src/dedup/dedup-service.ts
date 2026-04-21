import { isUrlSeen, markUrlsBatch } from "../db/repositories/seen-urls.js";
import {
  getRecentTitleKeys,
  markTitlesRecent,
  normalizeTitleKey,
} from "../db/repositories/recent-titles.js";
import { createChildLogger } from "../utils/logger.js";
import type { CollectedItem } from "../collectors/types.js";

const log = createChildLogger("dedup");

/**
 * 2단계 중복 제거:
 *   1. 정규화 URL 기반 (같은 소스에서 재노출되는 경우)
 *   2. 정규화 제목 기반 — 최근 3일 이내 이미 다룬 제목은 제외
 *      (React Blog → HN → Reddit 처럼 여러 출처에 같은 스토리가 올라오는 경우)
 */
export function dedup(items: CollectedItem[]): CollectedItem[] {
  const allTitleKeys = items.map((item) => normalizeTitleKey(item.title));
  const recentTitleKeys = getRecentTitleKeys(allTitleKeys);

  const seenUrls = new Set<string>();
  const seenTitleKeys = new Set<string>();
  const result: CollectedItem[] = [];

  let droppedByUrl = 0;
  let droppedByTitle = 0;

  for (const item of items) {
    const normalizedUrl = normalizeUrl(item.url);
    const titleKey = normalizeTitleKey(item.title);

    if (seenUrls.has(normalizedUrl) || isUrlSeen(normalizedUrl)) {
      droppedByUrl++;
      continue;
    }

    if (seenTitleKeys.has(titleKey) || recentTitleKeys.has(titleKey)) {
      droppedByTitle++;
      continue;
    }

    seenUrls.add(normalizedUrl);
    seenTitleKeys.add(titleKey);
    result.push(item);
  }

  log.info(
    { before: items.length, after: result.length, droppedByUrl, droppedByTitle },
    "중복 제거 완료"
  );

  return result;
}

/**
 * URL 을 30일 캐시에 기록. 수집된 모든 unique 아이템에 적용 — 다이제스트 미포함 여부와 무관하게
 * "이미 본 URL" 이라 차기 수집에서 재처리하지 않기 위해.
 */
export function markUrlsSeen(items: CollectedItem[]): void {
  markUrlsBatch(
    items.map((item) => ({
      url: normalizeUrl(item.url),
      title: item.title,
      sourceId: item.sourceId,
    }))
  );
}

/**
 * 실제로 다이제스트에 담긴 스토리 제목만 3일 윈도우로 기록. 크로스-데이 중복 주제를
 * 차기 실행에서 Claude 가 디모트하도록 컨텍스트에 주입됨.
 */
export function markTitlesSeenInDigest(titles: string[]): void {
  markTitlesRecent(
    titles.map((title) => ({
      key: normalizeTitleKey(title),
      title,
    }))
  );
}

/**
 * 호환용 wrapper — 기존 pipeline 의 `markAsSeen(uniqueItems)` 호출을 깨지 않기 위해 남김.
 * 새 코드는 `markUrlsSeen` / `markTitlesSeenInDigest` 를 분리해서 쓸 것.
 */
export function markAsSeen(items: CollectedItem[]): void {
  markUrlsSeen(items);
  markTitlesSeenInDigest(items.map((item) => item.title));
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
