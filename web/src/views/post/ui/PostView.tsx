import { notFound } from "next/navigation";

import { getBriefTone, getPost, PostCover, PostTags } from "@/entities/post";
import type { PostSource } from "@/shared/config";
import { formatKoreanDate, renderPostDocument, renderPostMarkdown, withBasePath } from "@/shared/lib";

import styles from "./PostView.module.css";

/** 요약·할 일 같은 한 줄 항목도 본문과 같은 렌더러를 쓰되 바깥 <p> 는 벗긴다 */
function renderInline(markdown: string): string {
  return renderPostMarkdown(markdown).replace(/^<p>|<\/p>\s*$/g, "");
}

function getSourceDateRange(sources: PostSource[]): string | null {
  const dates = sources.map((s) => s.publishedAt).filter((d): d is string => Boolean(d)).sort();
  if (dates.length === 0) return null;
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first === last ? first : `${first} ~ ${last}`;
}

/** 본문 뒤에 붙는 고정 섹션도 목차에 넣는다 */
const TRAILING_TOC = [
  { id: "original", text: "원문" },
  { id: "briefs", text: "그 외 오늘 소식" },
  { id: "sources", text: "출처" },
];

export function PostView({ slug }: { slug: string }) {
  const post = getPost(slug);
  if (!post) notFound();

  const { html, headings } = renderPostDocument(post.body);
  const sourceDateRange = getSourceDateRange(post.sources);
  const primarySource = post.sources[0];
  const hasBriefs = Boolean(post.briefs && post.briefs.length > 0);
  const trailingToc = TRAILING_TOC.filter((item) => item.id !== "briefs" || hasBriefs);

  return (
    <main className={styles.layout}>
      <article className={styles.article}>
        <header className={styles.header}>
          <PostTags tags={post.tags} />
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.dek}>{post.dek}</p>
          <PostCover cover={post.cover} priority />
        </header>

        <section className={styles.tldr} aria-label="요약">
          <p className={styles.boxLabel}>요약</p>
          <ul>
            {post.tldr.map((line) => (
              <li key={line} dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
            ))}
          </ul>
        </section>

        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />

        {post.actions && post.actions.length > 0 && (
          <section className={styles.actions} aria-label="해 볼 것">
            <p className={styles.boxLabel}>프론트엔드 팀이 해 볼 것</p>
            <ol>
              {post.actions.map((line) => (
                <li key={line} dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
              ))}
            </ol>
          </section>
        )}

        {primarySource && (
          <section aria-labelledby="original">
            <h2 id="original" className={styles.sectionTitle}>원문</h2>
            <a className={styles.linkCard} href={primarySource.url} target="_blank" rel="noopener noreferrer">
              {primarySource.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={withBasePath(primarySource.image)} alt="" loading="lazy" />
              )}
              <span>
                <strong>{primarySource.title}</strong>
                <small>
                  {primarySource.publisher}
                  {primarySource.publishedAt && ` · ${primarySource.publishedAt}`}
                </small>
              </span>
            </a>
          </section>
        )}

        {hasBriefs && (
          <section aria-labelledby="briefs">
            <h2 id="briefs" className={styles.sectionTitle}>그 외 오늘 소식</h2>
            <ul className={styles.briefs}>
              {post.briefs!.map((brief) => (
                <li key={brief.title}>
                  <span className={styles.badge} data-tone={getBriefTone(brief.label)}>
                    {brief.label}
                  </span>
                  <a href={`#source-${brief.sourceId}`} className={styles.briefTitle}>{brief.title}</a>
                  <small>{brief.note}</small>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="sources">
          <h2 id="sources" className={styles.sectionTitle}>출처</h2>
          <ol className={styles.sources}>
            {post.sources.map((source) => (
              <li key={source.id} id={`source-${source.id}`}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>
                <span> — {source.publisher}{source.publishedAt && `, ${source.publishedAt}`}</span>
              </li>
            ))}
          </ol>
        </section>
      </article>

      <aside className={styles.aside} aria-label="글 정보와 목차">
        <dl className={styles.facts}>
          <div><dt>발행</dt><dd>{formatKoreanDate(post.date)}</dd></div>
          {sourceDateRange && <div><dt>원문</dt><dd>{sourceDateRange}</dd></div>}
          <div><dt>분량</dt><dd>{post.readingMinutes}분 읽기 · 출처 {post.sources.length}</dd></div>
        </dl>
        <nav aria-labelledby="toc-title" className={styles.toc}>
          <p id="toc-title" className={styles.tocTitle}>목차</p>
          <ul>
            {headings.map((heading) => (
              <li key={heading.id} data-depth={heading.depth}>
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
            {trailingToc.map((item) => (
              <li key={item.id} data-depth={2}>
                <a href={`#${item.id}`}>{item.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </main>
  );
}
