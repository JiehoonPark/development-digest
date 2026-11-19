import Link from "next/link";

import { listPosts, PostCover, PostMeta } from "@/entities/post";
import type { PostData } from "@/shared/config";
import { ROUTES } from "@/shared/config";

import { splitTitle } from "../lib/split-title";
import styles from "./BlogHomeView.module.css";
import { PostIndex, type PostIndexItem } from "./PostIndex";
import { RisoHero } from "./RisoHero";

function toIndexItem(post: PostData): PostIndexItem {
  const { main, sub } = splitTitle(post.title);
  return {
    href: ROUTES.post(post.slug),
    date: post.date,
    main,
    sub,
    cover: <PostCover cover={post.cover} variant="card" />,
    hasCover: Boolean(post.cover),
  };
}

/** 홈: 리소 머리말 → 최신 글 하나 → 나머지 글 목록. 구역 라벨 없이 여백으로만 나눈다 */
export function BlogHomeView() {
  const posts = listPosts();
  const [latest, ...rest] = posts;

  if (!latest) {
    return (
      <main className={styles.page}>
        <p className={styles.empty}>아직 발행된 글이 없습니다.</p>
      </main>
    );
  }

  const latestTitle = splitTitle(latest.title);

  return (
    <main className={styles.page}>
      <RisoHero postCount={posts.length} />

      <Link href={ROUTES.post(latest.slug)} className={styles.feature}>
        <PostCover cover={latest.cover} priority />
        <PostMeta date={latest.date} tags={latest.tags} />
        <span className={styles.featureTitle}>{latestTitle.main}</span>
        {latestTitle.sub && <span className={styles.featureSub}>{latestTitle.sub}</span>}
        <span className={styles.featureDek}>{latest.dek}</span>
      </Link>

      {rest.length > 0 && <PostIndex items={rest.map(toIndexItem)} />}
    </main>
  );
}
