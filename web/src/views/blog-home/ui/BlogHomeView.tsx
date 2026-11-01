import Link from "next/link";

import { formatIssue, getBriefTone, getIssueNumbers, IssueLine, listPosts, PostCover } from "@/entities/post";
import type { PostBrief, PostData } from "@/shared/config";
import { ROUTES } from "@/shared/config";
import { formatShortKoreanDate } from "@/shared/lib";

import { splitTitle } from "../lib/split-title";
import styles from "./BlogHomeView.module.css";
import { PostIndex, type PostIndexItem } from "./PostIndex";
import { TerminalHero, type TerminalPost } from "./TerminalHero";

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

function toTerminalPost(post: PostData, issue: number): TerminalPost {
  return {
    no: issue,
    issue: formatIssue(issue),
    date: post.date,
    href: ROUTES.post(post.slug),
    tag: post.tags[0] ?? "",
    title: splitTitle(post.title).main,
    tags: post.tags,
  };
}

function toIndexItem(post: PostData, issue: number): PostIndexItem {
  const { main, sub } = splitTitle(post.title);
  return {
    href: ROUTES.post(post.slug),
    issue: formatIssue(issue),
    date: post.date,
    main,
    sub,
    tags: post.tags,
    dek: post.dek,
    cover: <PostCover cover={post.cover} variant="card" />,
    hasCover: Boolean(post.cover),
  };
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

  const issues = getIssueNumbers(posts);
  const briefs = collectRecentBriefs(posts);
  const latestTitle = splitTitle(latest.title);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-label="오늘의 글">
        <TerminalHero posts={posts.map((post) => toTerminalPost(post, issues.get(post.slug)!))} />

        <Link href={ROUTES.post(latest.slug)} className={styles.feature}>
          <IssueLine issue={issues.get(latest.slug)!} date={latest.date} tags={latest.tags} label="LATEST" />
          <h1 className={styles.featureTitle}>{latestTitle.main}</h1>
          {latestTitle.sub && <p className={styles.featureSub}>{latestTitle.sub}</p>}
          <PostCover cover={latest.cover} priority />
          <p className={styles.featureDek}>{latest.dek}</p>
          <span className={styles.read}>읽기 →</span>
        </Link>
      </section>

      {briefs.length > 0 && (
        <section className={styles.briefs} aria-labelledby="briefs">
          <h2 id="briefs" className={styles.label}>
            BRIEFS
          </h2>
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
        </section>
      )}

      <PostIndex items={posts.map((post) => toIndexItem(post, issues.get(post.slug)!))} />
    </main>
  );
}
