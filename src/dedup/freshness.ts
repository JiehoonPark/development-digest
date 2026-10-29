import type { CollectedItem } from "../collectors/types.js";
import { hoursAgo } from "../utils/date.js";

/**
 * 발행 후 이 기간이 지난 글은 수집 단계에서 버린다.
 * RSS 피드가 오래된 글(예: 2025-12 React 보안 공지)을 계속 노출해도
 * 매일 "오늘의 소식"으로 다시 선정되지 않게 한다. 주말(월요일 발행)도 충분히 포함한다.
 */
export const MAX_ITEM_AGE_DAYS = 14;

const HOURS_PER_DAY = 24;

export interface FreshnessResult {
  fresh: CollectedItem[];
  stale: CollectedItem[];
}

export function splitByFreshness(
  items: CollectedItem[],
  now: Date = new Date(),
  maxAgeDays: number = MAX_ITEM_AGE_DAYS
): FreshnessResult {
  const maxAgeHours = maxAgeDays * HOURS_PER_DAY;
  const fresh: CollectedItem[] = [];
  const stale: CollectedItem[] = [];

  for (const item of items) {
    const publishedAt = new Date(item.publishedAt);
    // 날짜를 해석할 수 없으면 오래됐다고 단정하지 않는다 (수집기는 이미 유효한 날짜만 넘긴다).
    const hasValidDate = !Number.isNaN(publishedAt.getTime());
    const isTooOld = hasValidDate && hoursAgo(publishedAt, now) > maxAgeHours;

    if (isTooOld) stale.push(item);
    else fresh.push(item);
  }

  return { fresh, stale };
}
