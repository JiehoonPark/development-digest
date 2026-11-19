import { formatKoreanDate } from "@/shared/lib";

import styles from "./PostMeta.module.css";

interface PostMetaProps {
  date: string;
  tags?: string[];
}

/** 글 메타 한 줄: 2026년 11월 11일 · CSS · 성능 최적화 */
export function PostMeta({ date, tags = [] }: PostMetaProps) {
  return (
    <p className={styles.line}>
      <time dateTime={date}>{formatKoreanDate(date)}</time>
      {tags.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
        </span>
      ))}
    </p>
  );
}
