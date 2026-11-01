"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import styles from "./PostIndex.module.css";

export interface PostIndexItem {
  href: string;
  issue: string;
  date: string;
  main: string;
  sub?: string;
  tags: string[];
  dek: string;
  /** 서버에서 그린 커버(<PostCover>). 글 데이터 모듈(fs)을 클라이언트 번들에 끌어오지 않으려고 요소로 받는다 */
  cover: ReactNode;
  hasCover: boolean;
}

type ViewMode = "list" | "grid";

const VIEW_LABELS: Record<ViewMode, string> = { list: "LIST", grid: "GRID" };

/**
 * 전체 글 목록. 기본은 한 줄에 한 편씩 큰 제목으로 늘어놓는 목록이고, 격자 보기로 바꿀 수 있다.
 * 목록에서 줄에 마우스를 올리면 그 줄이 강조색으로 반전되고 커서 옆에 커버가 따라 뜬다(마우스가 있는 기기만).
 */
export function PostIndex({ items }: { items: PostIndexItem[] }) {
  const [view, setView] = useState<ViewMode>("list");
  const [hovered, setHovered] = useState<PostIndexItem | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const movePreview = (event: PointerEvent) => {
    previewRef.current?.style.setProperty("--x", `${event.clientX}px`);
    previewRef.current?.style.setProperty("--y", `${event.clientY}px`);
  };

  return (
    <section aria-labelledby="all-posts" className={styles.section}>
      <div className={styles.head}>
        <h2 id="all-posts" className={styles.heading}>
          INDEX <span className={styles.count}>({items.length})</span>
        </h2>
        <div className={styles.toggle} role="group" aria-label="보기 방식">
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
            <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)}>
              {VIEW_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <ol className={styles.list} onPointerMove={movePreview} onPointerLeave={() => setHovered(null)}>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.row} onPointerEnter={() => setHovered(item)}>
                <span className={styles.issue}>{item.issue}</span>
                <span className={styles.title}>
                  {item.main}
                  {item.sub && <span className={styles.sub}> — {item.sub}</span>}
                </span>
                <span className={styles.tags}>{item.tags.join(" · ")}</span>
                <time className={styles.date} dateTime={item.date}>
                  {item.date.replaceAll("-", ".")}
                </time>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.card}>
                {item.cover}
                <span className={styles.cardIssue}>
                  {item.issue} — {item.date.replaceAll("-", ".")}
                </span>
                <span className={styles.cardTitle}>{item.main}</span>
                <span className={styles.cardDek}>{item.dek}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={previewRef}
        className={styles.preview}
        data-visible={view === "list" && Boolean(hovered?.hasCover)}
        aria-hidden
        style={{ "--x": "-999px", "--y": "-999px" } as CSSProperties}
      >
        {hovered?.hasCover && hovered.cover}
      </div>
    </section>
  );
}
