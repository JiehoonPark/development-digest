import Link from "next/link";

import { CategoryBadge, getCategoryMeta } from "@/entities/category";
import { LabelBadge } from "@/entities/label";
import { Callout } from "@/shared/ui";
import { cx } from "@/shared/lib";
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

/** 카드에서 시각적으로 숨기는 라벨 — 데이터·검색·아카이브는 유지되지만 배지로는 표시 안 함 */
const HIDDEN_LABELS = new Set<string>(["typescript"]);

export function ArticleBlock({ item, date, forwardLabels = true }: ArticleBlockProps) {
  const isRelated = isRelatedClusterItem(item);
  const category = getCategoryMeta(item.category);
  const title = getDisplayTitle(item);
  const [year, month, day] = date.split("-");
  const detailHref = ROUTES.articleDetail(year, month, day, item.slug);
  const visibleLabels = (item.labels ?? []).filter((l) => !HIDDEN_LABELS.has(l));

  return (
    <article
      className={cx(styles.block, isRelated && styles.clusterRelated)}
      data-labels={forwardLabels ? (item.labels ?? []).join(",") : undefined}
      data-topic={item.topicId ?? undefined}
    >
      <div className={styles.icon} aria-hidden>
        {category.emoji}
      </div>

      <div className={styles.main}>
        <Link href={detailHref} className={styles.title}>
          {title}
        </Link>

        <div className={styles.meta}>
          <span>via {item.sourceName}</span>
        </div>

        {!isRelated && (visibleLabels.length > 0 || item.category !== "tech") ? (
          <div className={styles.labels}>
            <CategoryBadge category={item.category} />
            {visibleLabels.map((l) => (
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

      {item.relatedCount ? (
        <div className={styles.right}>
          <span className={styles.engage}>관련 {item.relatedCount}건</span>
        </div>
      ) : null}
    </article>
  );
}
