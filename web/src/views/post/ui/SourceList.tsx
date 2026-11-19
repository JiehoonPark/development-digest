"use client";

import { useEffect, useRef } from "react";

import type { PostSource } from "@/shared/config";

import styles from "./PostView.module.css";

const SOURCE_HASH = /^#source-(\d+)$/;

interface SourceListProps {
  sources: PostSource[];
  /** 이 글이 기사 하나에서 출발했으면 그 출처 번호(보통 1) */
  originId?: number;
}

/**
 * 글 끝 출처 목록. 기본은 접어 두고 개수만 보인다.
 * 본문의 [n] 을 누르거나 #source-n 주소로 들어오면 목록을 펼친 뒤 그 줄로 내려간다.
 */
export function SourceList({ sources, originId }: SourceListProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const openAt = (hash: string) => {
      if (!SOURCE_HASH.test(hash) || !detailsRef.current) return false;
      detailsRef.current.open = true;
      const target = document.getElementById(hash.slice(1));
      // 주소를 replaceState 로 바꾸면 :target 이 갱신되지 않아 강조를 직접 표시한다
      detailsRef.current.querySelectorAll("[data-active]").forEach((item) => item.removeAttribute("data-active"));
      target?.setAttribute("data-active", "true");
      // 펼친 직후 다음 프레임에 위치가 잡히므로 그때 스크롤한다
      requestAnimationFrame(() => target?.scrollIntoView({ block: "center" }));
      return true;
    };

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="#source-"]');
      if (!link) return;
      const hash = link.getAttribute("href") ?? "";
      if (openAt(hash)) {
        event.preventDefault();
        history.replaceState(null, "", hash);
      }
    };

    openAt(location.hash);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <details ref={detailsRef} className={styles.sourceDetails} id="sources">
      <summary className={styles.sourceSummary}>출처 {sources.length}개</summary>
      <ol className={styles.sources}>
        {sources.map((source) => (
          <li key={source.id} id={`source-${source.id}`} value={source.id}>
            {source.id === originId && <span className={styles.originBadge}>이 글을 시작한 글</span>}
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.title}
            </a>
            <span> — {source.publisher}{source.publishedAt && `, ${source.publishedAt}`}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
