"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cx } from "@/shared/lib";
import { ROUTES } from "@/shared/config";

import styles from "./Sidebar.module.css";

interface NavItem {
  label: string;
  emoji: string;
  href: string;
  /** 경로가 서브트리에도 매치되어야 하는지 여부 (예: `/2026/04/19/…`는 오늘/최근의 하위) */
  matchPrefix?: boolean;
}

const TOP_ITEMS: NavItem[] = [
  { label: "오늘의 다이제스트", emoji: "📅", href: ROUTES.home },
];

const EXPLORE_ITEMS: NavItem[] = [
  { label: "전체 아카이브", emoji: "📚", href: ROUTES.archive, matchPrefix: true },
  { label: "소스 목록", emoji: "📡", href: ROUTES.sources },
];

const SETTINGS_ITEMS: NavItem[] = [
  { label: "설정", emoji: "⚙️", href: ROUTES.settings },
];

export function Sidebar() {
  const pathname = usePathname() ?? "";

  const isActive = (item: NavItem) => {
    if (item.matchPrefix) return pathname.startsWith(item.href);
    return pathname === item.href || pathname === item.href.replace(/\/$/, "");
  };

  const renderItem = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={cx(styles.item, isActive(item) && styles.active)}
    >
      <span className={styles.emoji}>{item.emoji}</span>
      <span className={styles.label}>{item.label}</span>
    </Link>
  );

  return (
    <aside className={styles.sidebar} aria-label="사이드바 네비게이션">
      <div className={styles.inner}>
        <WorkspaceHeader />
        <SearchTrigger />

        <nav className={styles.scroll}>
          <Section>{TOP_ITEMS.map(renderItem)}</Section>

          <Section label="탐색">{EXPLORE_ITEMS.map(renderItem)}</Section>

          <Section label="설정">{SETTINGS_ITEMS.map(renderItem)}</Section>
        </nav>
      </div>
    </aside>
  );
}

function WorkspaceHeader() {
  return (
    <div className={styles.wsHeader}>
      <div className={styles.wsAvatar}>📬</div>
      <div className={styles.wsName}>Dev Digest</div>
    </div>
  );
}

function SearchTrigger() {
  return (
    <button
      type="button"
      className={styles.searchTrigger}
      data-cmdk-trigger=""
      aria-label="검색 (⌘K)"
    >
      <span>🔍</span>
      <span>검색</span>
      <span className={styles.kbd}>⌘K</span>
    </button>
  );
}

function Section({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <>
      {label ? <div className={styles.sectionLabel}>{label}</div> : null}
      {children}
    </>
  );
}
