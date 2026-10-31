import type { PostData } from "@/shared/config";
import { formatShortKoreanDate } from "@/shared/lib";

import styles from "./PostMeta.module.css";

type PostMetaProps = Pick<PostData, "date">;

/** 글 카드 아래 발행일 */
export function PostMeta({ date }: PostMetaProps) {
  return (
    <p className={styles.meta}>
      <time dateTime={date}>{formatShortKoreanDate(date)}</time>
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
