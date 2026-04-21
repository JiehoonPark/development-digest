import Link from "next/link";

import { getCategoryMeta } from "@/entities/category";
import { LabelBadge } from "@/entities/label";
import { Callout } from "@/shared/ui";
import { cx, formatEngagement } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import type { ArchiveItem } from "@/shared/config";

import { getDisplayTitle, isRelatedClusterItem } from "../lib/display";
import styles from "./ArticleBlock.module.css";

interface ArticleBlockProps {
  item: ArchiveItem;
  /** 아카이브 날짜 — 디테일 페이지 URL 생성에 필요 */
  date: string;
  /** 라벨 필터 data-attribute 연동을 위한 옵션 */
  forwardLabels?: boolean;
}

export function ArticleBlock({ item, date, forwardLabels = true }: ArticleBlockProps) {
  const isRelated = isRelatedClusterItem(item);
  const category = getCategoryMeta(item.category);
  const title = getDisplayTitle(item);
  const [year, month, day] = date.split("-");
  const detailHref = ROUTES.articleDetail(year, month, day, item.slug);

  return (
    <article
      className={cx(styles.block, isRelated && styles.clusterRelated)}
      data-labels={forwardLabels ? (item.labels ?? []).join(",") : undefined}
      data-topic={item.topicId ?? undefined}
    >
      {!isRelated ? (
        <div className={styles.icon} aria-hidden>
          {category.emoji}
        </div>
      ) : null}

      <div className={styles.main}>
        <Link href={detailHref} className={styles.title}>
          {title}
        </Link>

        <div className={styles.meta}>
          <span>via {item.sourceName}</span>
          {item.contentType === "video" ? (
            <>
              <span className={styles.metaDot}>·</span>
              <span className={styles.videoTag}>▶ Video</span>
            </>
          ) : null}
        </div>

        {item.labels && item.labels.length > 0 ? (
          <div className={styles.labels}>
            {item.labels.map((l) => (
              <LabelBadge key={l} label={l} />
            ))}
          </div>
        ) : null}

        {item.summary ? <p className={styles.summary}>{item.summary}</p> : null}

        {item.whyItMatters && !isRelated ? (
          <div className={styles.why}>
            <Callout emoji="💡" variant="accent">
              {item.whyItMatters}
            </Callout>
          </div>
        ) : null}
      </div>

      <div className={styles.right}>
        {item.engagement ? (
          <span className={styles.engage}>⬆ {formatEngagement(item.engagement)}</span>
        ) : null}
        {item.relatedCount ? (
          <span className={styles.engage}>관련 {item.relatedCount}건</span>
        ) : null}
      </div>
    </article>
  );
}
