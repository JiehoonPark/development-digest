import { notFound } from "next/navigation";

import { getPost, PostCover, PostMeta } from "@/entities/post";
import { PostClips } from "@/widgets/post-clips";
import { PostDemos } from "@/widgets/post-demos";
import { renderPostDocument, renderPostMarkdown } from "@/shared/lib";

import { getCitedSources, getOriginSourceId } from "../lib/sources";
import styles from "./PostView.module.css";
import { SourceList } from "./SourceList";

/** 요약·할 일 같은 한 줄 항목도 본문과 같은 렌더러를 쓰되 바깥 <p> 는 벗긴다 */
function renderInline(markdown: string): string {
  return renderPostMarkdown(markdown).replace(/^<p>|<\/p>\s*$/g, "");
}

export function PostView({ slug }: { slug: string }) {
  const post = getPost(slug);
  if (!post) notFound();

  const { html, headings } = renderPostDocument(post.body);
  const sources = getCitedSources(post);

  return (
    <main className={styles.layout}>
      <article className={styles.article}>
        <header className={styles.header}>
          <PostMeta date={post.date} tags={post.tags} />
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.dek}>{post.dek}</p>
          <PostCover cover={post.cover} priority />
        </header>

        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
        <PostDemos />
        <PostClips />

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

        {sources.length > 0 && <SourceList sources={sources} originId={getOriginSourceId(post)} />}
      </article>

      <aside className={styles.aside} aria-label="목차">
        <nav aria-labelledby="toc-title" className={styles.toc}>
          <p id="toc-title" className={styles.tocTitle}>목차</p>
          <ul>
            {headings.map((heading) => (
              <li key={heading.id} data-depth={heading.depth}>
                <a href={`#${heading.id}`}><span>{heading.text}</span></a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </main>
  );
}
