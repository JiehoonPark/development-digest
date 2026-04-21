import { notFound } from "next/navigation";

import { getArchive } from "@/entities/archive";
import { getDisplayTitle } from "@/entities/article";
import { LabelBadge } from "@/entities/label";
import { Callout, PageContainer } from "@/shared/ui";
import { cx, renderTranslatedMarkdown } from "@/shared/lib";
import { EXTERNAL, ROUTES } from "@/shared/config";
import type { ArchiveItem } from "@/shared/config";
import { TopbarAuto } from "@/widgets/topbar";

import styles from "./ArticleDetailView.module.css";

interface ArticleDetailViewProps {
  year: string;
  month: string;
  day: string;
  slug: string;
}

export function ArticleDetailView({ year, month, day, slug }: ArticleDetailViewProps) {
  const date = `${year}-${month}-${day}`;
  const archive = getArchive(date);
  if (!archive) notFound();

  const item = findBySlug(archive.sections.flatMap((s) => s.items), slug);
  if (!item) notFound();

  const title = getDisplayTitle(item);

  return (
    <>
      <TopbarAuto
        crumbs={[
          { label: "Dev Digest", icon: "📬", href: ROUTES.home },
          { label: date, icon: "📅", href: ROUTES.dailyDigest(year, month, day) },
          { label: title },
        ]}
      />
      <PageContainer>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {title !== item.title ? (
            <p className={styles.originalTitle}>{item.title}</p>
          ) : null}

          <div className={styles.meta}>
            <span>📅 {date}</span>
            <span>📰 {item.sourceName}</span>
            {item.contentType === "video" ? <span>🎬 Video</span> : null}
          </div>

          {item.labels && item.labels.length > 0 ? (
            <div className={styles.badges}>
              {item.labels.map((l) => (
                <LabelBadge key={l} label={l} />
              ))}
            </div>
          ) : null}
        </header>

        <section className={styles.section}>
          <h2>요약</h2>
          <p className={styles.summary}>{item.summary}</p>
        </section>

        {item.keyPoints?.length ? (
          <section className={styles.section}>
            <h2>핵심 포인트</h2>
            <ul className={styles.keyPoints}>
              {item.keyPoints.map((kp, i) => (
                <li key={i}>{kp}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {item.whyItMatters ? (
          <section className={styles.section}>
            <h2>왜 중요한가</h2>
            <Callout emoji="💡" variant="accent">
              {item.whyItMatters}
            </Callout>
          </section>
        ) : null}

        {item.translatedContent ? (
          <section className={styles.section}>
            <h2>📄 전문 번역</h2>
            <div
              className={styles.translated}
              dangerouslySetInnerHTML={{
                __html: renderTranslatedMarkdown(item.translatedContent),
              }}
            />
          </section>
        ) : null}

        <div className={styles.cta}>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            🔗 원문 보기
          </a>
          <a className={cx(styles.feedback)} href={buildFeedbackHref(item, date, title)}>
            👍 유용해요
          </a>
        </div>
      </PageContainer>
    </>
  );
}

function findBySlug(items: ArchiveItem[], slug: string): ArchiveItem | undefined {
  return items.find((i) => i.slug === slug);
}

function buildFeedbackHref(item: ArchiveItem, date: string, title: string): string {
  const issueTitle = encodeURIComponent(`👍 ${date} ${title.slice(0, 50)}`);
  const labels = encodeURIComponent("feedback,liked");
  const body = encodeURIComponent(
    `**Article**: ${title}\n**URL**: ${item.url}\n**Date**: ${date}\n**Source**: ${item.sourceName}`
  );
  return `https://github.com/${EXTERNAL.feedbackRepo}/issues/new?title=${issueTitle}&labels=${labels}&body=${body}`;
}
