import styles from "./CategoryBadge.module.css";

const CATEGORY_META: Record<string, { emoji: string; label: string; tone: string }> = {
  hot:     { emoji: "🔥", label: "오늘의 화제",     tone: styles.hot },
  insight: { emoji: "💡", label: "알면 좋은 정보", tone: styles.insight },
  video:   { emoji: "▶",  label: "영상",           tone: styles.video },
};

interface CategoryBadgeProps {
  category: string;
}

/**
 * hot/insight/video 만 배지로 렌더. tech 는 기본 카테고리라 생략해 시각 소음을 줄임.
 */
export function CategoryBadge({ category }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;
  return (
    <span className={`${styles.badge} ${meta.tone}`}>
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}
