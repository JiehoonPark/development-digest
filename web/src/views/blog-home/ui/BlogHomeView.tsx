import Link from "next/link";

import { getBriefTone, listPosts, PostCover, PostMeta } from "@/entities/post";
import type { PostBrief, PostData } from "@/shared/config";
import { ROUTES } from "@/shared/config";
import { formatShortKoreanDate } from "@/shared/lib";

import styles from "./BlogHomeView.module.css";

const MAX_RECENT_BRIEFS = 6;

interface RecentBrief extends PostBrief {
  date: string;
  url: string;
}

/** 최근 글들에 붙은 "그 외 소식"을 날짜순으로 모은다. 원문 URL 이 없는 항목은 뺀다. */
function collectRecentBriefs(posts: PostData[]): RecentBrief[] {
  return posts
    .flatMap((post) =>
      (post.briefs ?? []).map((brief) => ({
        ...brief,
        date: post.date,
        url: post.sources.find((source) => source.id === brief.sourceId)?.url ?? "",
      }))
    )
    .filter((brief) => brief.url)
    .slice(0, MAX_RECENT_BRIEFS);
}

export function BlogHomeView() {
  const posts = listPosts();
  const [latest] = posts;

  if (!latest) {
    return (
      <main className={styles.page}>
        <p className={styles.empty}>
          아직 발행된 글이 없습니다. <Link href={ROUTES.digestToday}>지난 다이제스트 보기 →</Link>
        </p>
      </main>
    );
  }

  const briefs = collectRecentBriefs(posts);

  return (
    <main className={styles.page}>
      <section className={styles.top} aria-label="오늘의 글과 짧은 소식">
        <Link href={ROUTES.post(latest.slug)} className={styles.feature}>
          <PostCover cover={latest.cover} priority />
          <div className={styles.featureText}>
            <p className={styles.eyebrow}>오늘의 글</p>
            <h1 className={styles.featureTitle}>{latest.title}</h1>
            <p className={styles.featureDek}>{latest.dek}</p>
            <PostMeta {...latest} />
          </div>
        </Link>

        {briefs.length > 0 && (
          <div className={styles.briefs}>
            <h2 className={styles.blockTitle}>최신 짧은 소식</h2>
            <ul>
              {briefs.map((brief) => (
                <li key={`${brief.date}-${brief.title}`}>
                  <a href={brief.url} target="_blank" rel="noopener noreferrer">
                    <span className={styles.chip} data-tone={getBriefTone(brief.label)}>
                      {brief.label}
                    </span>
                    <span className={styles.briefTitle}>{brief.title}</span>
                    <time className={styles.briefDate} dateTime={brief.date}>
                      {formatShortKoreanDate(brief.date)}
                    </time>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="all-posts">
        <h2 id="all-posts" className={styles.blockTitle}>
          전체 글 <span className={styles.count}>{posts.length}</span>
        </h2>
        <ul className={styles.grid}>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={ROUTES.post(post.slug)} className={styles.card}>
                <PostCover cover={post.cover} variant="card" badge={post.tags[0]} />
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardDek}>{post.dek}</p>
                <PostMeta {...post} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

