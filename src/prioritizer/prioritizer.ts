import type { CollectedItem } from "../collectors/types.js";
import { getDigestPreferences, type DigestPreferences } from "../../config/preferences.js";
import { calculateScore, type ScoredItem } from "./scoring.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("prioritizer");

const INTEREST_BONUS_PER_KEYWORD = 8;
const MAX_INTEREST_BONUS = 24;

export interface PrioritizedItem extends ScoredItem {
  /** 일치한 관심 키워드(점수 근거 확인용) */
  matchedInterests: string[];
}

/**
 * 규칙 점수로 정렬해 AI 분류에 넘길 후보를 고른다.
 * 제외 소스·키워드는 여기서 빼고(분류 비용도 아낌), 관심 키워드는 점수를 더한다.
 */
export function prioritize(
  items: CollectedItem[],
  preferences: DigestPreferences = getDigestPreferences()
): PrioritizedItem[] {
  const excludedSources = new Set(preferences.excludedSourceIds);
  const isExcludedSource = (item: CollectedItem) => excludedSources.has(item.sourceId);
  const hasExcludedKeyword = (item: CollectedItem) =>
    preferences.excludedKeywords.some((keyword) => matchesKeyword(searchableText(item), keyword));

  const eligible = items.filter((item) => !isExcludedSource(item) && !hasExcludedKeyword(item));

  const scored = eligible
    .map((item): PrioritizedItem => {
      const matchedInterests = preferences.preferredKeywords.filter((keyword) =>
        matchesKeyword(searchableText(item), keyword)
      );
      const interestBonus = Math.min(matchedInterests.length * INTEREST_BONUS_PER_KEYWORD, MAX_INTEREST_BONUS);
      return { ...item, score: calculateScore(item) + interestBonus, matchedInterests };
    })
    .sort((a, b) => b.score - a.score);

  const top = takeWithSourceCap(scored, preferences.maxCandidates, preferences.maxPerSource);

  log.info(
    {
      total: items.length,
      excluded: items.length - eligible.length,
      selected: top.length,
      withInterest: top.filter((item) => item.matchedInterests.length > 0).length,
      topScore: top[0]?.score ?? 0,
      bottomScore: top[top.length - 1]?.score ?? 0,
    },
    "우선순위 정렬 완료"
  );

  return top;
}

/** 점수순으로 채우되, 한 소스가 상한을 넘으면 다음 소스의 기사로 자리를 채운다 */
function takeWithSourceCap(sorted: PrioritizedItem[], limit: number, maxPerSource?: number): PrioritizedItem[] {
  if (maxPerSource === undefined) return sorted.slice(0, limit);

  const selected: PrioritizedItem[] = [];
  const countBySource = new Map<string, number>();
  for (const item of sorted) {
    if (selected.length >= limit) break;
    const count = countBySource.get(item.sourceId) ?? 0;
    if (count >= maxPerSource) continue;
    selected.push(item);
    countBySource.set(item.sourceId, count + 1);
  }
  return selected;
}

function searchableText(item: CollectedItem): string {
  return [item.title, item.summary ?? "", ...(item.tags ?? [])].join(" ");
}

/**
 * 한국어 키워드는 조사가 붙어도 맞게 부분 일치, 영문은 단어 경계로 맞춘다
 * ("React" 가 "Reactive" 에 걸리지 않게).
 */
function matchesKeyword(text: string, keyword: string): boolean {
  if (/[가-힣]/u.test(keyword)) return text.toLowerCase().includes(keyword.toLowerCase());
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i").test(text);
}
