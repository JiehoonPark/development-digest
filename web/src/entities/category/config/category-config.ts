import type { CategoryKey } from "@/shared/config";

interface CategoryMeta {
  key: CategoryKey;
  emoji: string;
  title: string;
  /** CSS 변수명 (--cat-hot 등) — 배경 틴트 포함 쌍으로 사용 */
  colorVar: string;
  bgVar: string;
}

const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  hot:     { key: "hot",     emoji: "📌", title: "오늘의 화제",     colorVar: "--cat-hot",     bgVar: "--cat-hot-bg" },
  tech:    { key: "tech",    emoji: "🛠", title: "프론트엔드 기술", colorVar: "--cat-tech",    bgVar: "--cat-tech-bg" },
  insight: { key: "insight", emoji: "💡", title: "알면 좋은 정보",  colorVar: "--cat-insight", bgVar: "--cat-insight-bg" },
  video:   { key: "video",   emoji: "🎬", title: "새 영상 알림",    colorVar: "--cat-video",   bgVar: "--cat-video-bg" },
};

const UNKNOWN_CATEGORY: CategoryMeta = {
  key: "tech",
  emoji: "📄",
  title: "기타",
  colorVar: "--text-tertiary",
  bgVar: "--bg-muted",
};

/**
 * 알 수 없는 카테고리가 들어와도 안전하게 기본값을 돌려준다.
 */
export function getCategoryMeta(key: string): CategoryMeta {
  return (CATEGORIES as Record<string, CategoryMeta>)[key] ?? UNKNOWN_CATEGORY;
}

export function isKnownCategory(key: string): key is CategoryKey {
  return key in CATEGORIES;
}

export type { CategoryMeta };
