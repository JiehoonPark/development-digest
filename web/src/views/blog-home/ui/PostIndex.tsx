"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import styles from "./PostIndex.module.css";

export interface PostIndexItem {
  href: string;
  date: string;
  main: string;
  sub?: string;
  /** 서버에서 그린 커버(<PostCover>). 글 데이터 모듈(fs)을 클라이언트 번들에 끌어오지 않으려고 요소로 받는다 */
  cover: ReactNode;
  hasCover: boolean;
}

/** "2026-04-21" → "4월 21일", 올해가 아니면 "2025년 4월 21일" */
function formatListDate(isoDate: string, currentYear: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const monthDay = `${month}월 ${day}일`;
  return year === currentYear ? monthDay : `${year}년 ${monthDay}`;
}

/**
 * 지난 글 목록 — 제목과 날짜 두 칸, 얇은 선. 줄에 마우스를 올리면 커서 옆에 커버가 따라 뜬다(마우스가 있는 기기만).
 */
export function PostIndex({ items }: { items: PostIndexItem[] }) {
  const [hovered, setHovered] = useState<PostIndexItem | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const currentYear = Number(items[0]?.date.slice(0, 4));

  const movePreview = (event: PointerEvent) => {
    previewRef.current?.style.setProperty("--x", `${event.clientX}px`);
    previewRef.current?.style.setProperty("--y", `${event.clientY}px`);
  };

  return (
    <section aria-label="지난 글" className={styles.section}>
      <ol className={styles.list} onPointerMove={movePreview} onPointerLeave={() => setHovered(null)}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.row} onPointerEnter={() => setHovered(item)}>
              <span className={styles.title}>
                {item.main}
                {item.sub && <span className={styles.sub}> — {item.sub}</span>}
              </span>
              <time className={styles.date} dateTime={item.date}>
                {formatListDate(item.date, currentYear)}
              </time>
            </Link>
          </li>
        ))}
      </ol>

      <div
        ref={previewRef}
        className={styles.preview}
        data-visible={Boolean(hovered?.hasCover)}
        aria-hidden
        style={{ "--x": "-999px", "--y": "-999px" } as CSSProperties}
      >
        {hovered?.hasCover && hovered.cover}
      </div>
    </section>
  );
}
