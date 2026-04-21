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

export function calculateScore(item: CollectedItem, now: Date = new Date()): number {
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
  // 월요일(getDay()===1)이면 주말 콘텐츠를 위해 기준 +24h 완화
  const mondayOffset = now.getDay() === 1 ? 24 : 0;
  const age = hoursAgo(new Date(item.publishedAt), now);
  if (age <= 6 + mondayOffset) score += 20;
  else if (age <= 12 + mondayOffset) score += 15;
  else if (age <= 24 + mondayOffset) score += 10;
  else if (age <= 48 + mondayOffset) score += 5;

  // 4. 프론트엔드 관련 키워드 보너스
  score += keywordBonus(item.title);

  // 5. 해외(영어) 콘텐츠 우선순위 보너스
  const isOverseas = source?.language === "en" ||
    item.category === "influencer-overseas" ||
    item.category === "community-overseas" ||
    item.category === "framework-blog" ||
    item.category === "newsletter";
  if (isOverseas) score += 10;

  // 6. 영상 보너스 — YouTube 는 engagement 메트릭을 수집 못 해서 항상 저평가되는 경향.
  // deep-tier 요약(≥80점)에 들어갈 기회를 주기 위해 고정 보너스.
  if (item.contentType === "video") score += 15;

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
