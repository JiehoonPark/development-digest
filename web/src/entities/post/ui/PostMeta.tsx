import type { PostData } from "@/shared/config";
import { formatShortKoreanDate } from "@/shared/lib";

import styles from "./PostMeta.module.css";

type PostMetaProps = Pick<PostData, "date" | "readingMinutes" | "sources">;

export function PostMeta({ date, readingMinutes, sources }: PostMetaProps) {
  return (
    <p className={styles.meta}>
      <time dateTime={date}>{formatShortKoreanDate(date)}</time>
      <span aria-hidden> · </span>
      {readingMinutes}분 읽기
      <span aria-hidden> · </span>
      출처 {sources.length}
    </p>
  );
}

/** 주제 태그 칩 목록 */
export function PostTags({ tags }: { tags: string[] }) {
  return (
    <ul className={styles.tags} aria-label="주제">
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}
