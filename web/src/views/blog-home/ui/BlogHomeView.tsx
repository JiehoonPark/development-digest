import Link from "next/link";

import { listPosts, PostCover, PostMeta } from "@/entities/post";
import type { PostData } from "@/shared/config";
import { ROUTES, SITE } from "@/shared/config";

import { splitTitle } from "../lib/split-title";
import styles from "./BlogHomeView.module.css";
import { PostIndex, type PostIndexItem } from "./PostIndex";

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

/**
 * 홈 — 틀은 조용히, 그림만 색을 낸다(Stripe Press · Works in Progress 식).
 * 소개 상자 없이 최신 글 커버가 첫 화면을 맡고, 그 아래 큰 제목 · 소개, 이어서 지난 글 목록.
 * 구역 라벨·장식 없이 크기와 여백으로만 위계를 나눈다.
 */
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
      <h1 className={styles.srOnly}>{SITE.title}</h1>

      <Link href={ROUTES.post(latest.slug)} className={styles.feature}>
        <div className={styles.featureCover}>
          <PostCover cover={latest.cover} priority />
        </div>
        <div className={styles.featureText}>
          <PostMeta date={latest.date} tags={latest.tags} />
          <span className={styles.featureTitle}>{latestTitle.main}</span>
          {latestTitle.sub && <span className={styles.featureSub}>{latestTitle.sub}</span>}
          <span className={styles.featureDek}>{latest.dek}</span>
        </div>
      </Link>

      {rest.length > 0 && <PostIndex items={rest.map(toIndexItem)} />}
    </main>
  );
}
