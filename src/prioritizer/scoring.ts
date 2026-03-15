import type { CollectedItem } from "../collectors/types.js";
import { getSourceById } from "../../config/sources/index.js";
import { hoursAgo } from "../utils/date.js";

export interface ScoredItem extends CollectedItem {
  score: number;
}

// 커뮤니티 카테고리: 누구나 올릴 수 있는 소스 → engagement 검증 필요
const COMMUNITY_CATEGORIES = new Set([
  "community-overseas",
  "community-domestic",
]);

export function calculateScore(item: CollectedItem): number {
  let score = 0;

  const source = getSourceById(item.sourceId);
  const weight = source?.weight ?? 5;
  const isCommunity = COMMUNITY_CATEGORIES.has(item.category);

  // 1. 소스 가중치 (0-10점, 정규화하여 0-30점)
  score += weight * 3;

  // 2. Engagement 점수 (0-30점)
  if (item.engagement) {
    score += engagementScore(item.engagement, item.sourceId);
  } else if (isCommunity) {
    // 커뮤니티 소스인데 engagement 없으면 감점 (검증 불가)
    score -= 10;
  }

  // 3. 최신성 점수 (0-20점)
  const age = hoursAgo(new Date(item.publishedAt));
  if (age <= 6) score += 20;
  else if (age <= 12) score += 15;
  else if (age <= 24) score += 10;
  else if (age <= 48) score += 5;

  // 4. 프론트엔드 관련 키워드 보너스
  score += keywordBonus(item.title);

  return Math.round(score);
}

function engagementScore(engagement: number, sourceId: string): number {
  if (sourceId.startsWith("hackernews")) {
    if (engagement >= 200) return 30;
    if (engagement >= 100) return 20;
    if (engagement >= 50) return 10;
    return 5;
  }

  if (sourceId.startsWith("reddit")) {
    if (engagement >= 500) return 30;
    if (engagement >= 200) return 20;
    if (engagement >= 50) return 10;
    return 5;
  }

  if (sourceId.startsWith("github")) {
    if (engagement >= 1000) return 30;
    if (engagement >= 500) return 20;
    if (engagement >= 100) return 10;
    return 5;
  }

  return 0;
}

const FE_KEYWORDS = [
  "react", "next.js", "nextjs", "typescript", "javascript",
  "css", "tailwind", "vue", "svelte", "astro",
  "frontend", "front-end", "프론트엔드",
  "component", "hook", "ssr", "rsc", "server component",
  "bundle", "vite", "webpack", "turbopack",
  "performance", "web vitals", "accessibility",
];

function keywordBonus(title: string): number {
  const lower = title.toLowerCase();
  const matchCount = FE_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  return Math.min(matchCount * 3, 15);
}
