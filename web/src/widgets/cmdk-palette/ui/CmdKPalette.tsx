"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { cx } from "@/shared/lib";
import { ROUTES } from "@/shared/config";

import { useSearchIndex, type SearchItem } from "../model/useSearchIndex";
import styles from "./CmdKPalette.module.css";

interface Page {
  label: string;
  icon: string;
  href: string;
}

const PAGES: Page[] = [
  { label: "오늘의 다이제스트", icon: "📅", href: ROUTES.home },
  { label: "전체 아카이브", icon: "📚", href: ROUTES.archive },
  { label: "설정", icon: "⚙️", href: ROUTES.settings },
];

interface CmdKPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CmdKPalette({ open, onClose }: CmdKPaletteProps) {
  const router = useRouter();
  const { search } = useSearchIndex(open);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 열릴 때 포커스 + 초기화
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open]);

  // 검색 결과 계산
  const pageMatches = useMemo(() => {
    if (!query.trim()) return PAGES;
    const q = query.toLowerCase();
    return PAGES.filter((p) => p.label.toLowerCase().includes(q));
  }, [query]);

  const articleMatches = useMemo(() => (open ? search(query) : []), [open, query, search]);

  const totalRows = pageMatches.length + articleMatches.length;

  const navigateTo = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [router, onClose]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => (s + 1) % Math.max(totalRows, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => (s - 1 + Math.max(totalRows, 1)) % Math.max(totalRows, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selected < pageMatches.length) {
          navigateTo(pageMatches[selected].href);
        } else {
          const idx = selected - pageMatches.length;
          const item = articleMatches[idx];
          if (item) navigateTo(item.detailUrl);
        }
      }
    },
    [selected, totalRows, pageMatches, articleMatches, navigateTo]
  );

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="빠른 검색"
      onClick={onClose}
    >
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputWrap}>
          <span aria-hidden>🔍</span>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="페이지·아티클 검색…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={onKeyDown}
          />
          <span className={styles.kbd}>Esc</span>
        </div>

        <div className={styles.list}>
          {pageMatches.length > 0 ? (
            <>
              <div className={styles.groupLabel}>페이지</div>
              {pageMatches.map((p, i) => (
                <CmdRow
                  key={p.href}
                  icon={p.icon}
                  label={p.label}
                  selected={selected === i}
                  onSelect={() => navigateTo(p.href)}
                />
              ))}
            </>
          ) : null}

          {articleMatches.length > 0 ? (
            <>
              <div className={styles.groupLabel}>아티클</div>
              {articleMatches.map((item, i) => (
                <CmdRow
                  key={item.detailUrl}
                  icon="📄"
                  label={item.title}
                  sub={`${item.date} · ${item.sourceName}`}
                  selected={selected === pageMatches.length + i}
                  onSelect={() => navigateTo(item.detailUrl)}
                />
              ))}
            </>
          ) : null}

          {totalRows === 0 ? (
            <div className={styles.empty}>일치하는 결과가 없습니다.</div>
          ) : null}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerItem}>
            <span className={styles.kbd}>↑↓</span> 이동
          </span>
          <span className={styles.footerItem}>
            <span className={styles.kbd}>↵</span> 선택
          </span>
          <span className={styles.footerItem}>
            <span className={styles.kbd}>Esc</span> 닫기
          </span>
        </div>
      </div>
    </div>
  );
}

function CmdRow({
  icon,
  label,
  sub,
  selected,
  onSelect,
}: {
  icon: string;
  label: string;
  sub?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cx(styles.row, selected && styles.selected)}
      onClick={onSelect}
    >
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
      {sub ? <span className={styles.sub}>{sub}</span> : null}
    </button>
  );
}

// 검색 URL 렌더를 위한 unused import 제거 용 — SearchItem은 useSearchIndex에서 export됨
export type { SearchItem };
