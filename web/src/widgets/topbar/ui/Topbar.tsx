"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { cx } from "@/shared/lib";

import styles from "./Topbar.module.css";

export interface Crumb {
  label: string;
  icon?: string;
  href?: string;
}

interface TopbarProps {
  crumbs: Crumb[];
  scrolled: boolean;
  /** 탑바 오른쪽 커스텀 액션. 미지정 시 기본 버튼(검색/공유/설정) 렌더 */
  actions?: ReactNode;
}

export function Topbar({ crumbs, scrolled, actions }: TopbarProps) {
  return (
    <header className={cx(styles.topbar, scrolled && styles.scrolled)} role="banner">
      <nav className={styles.breadcrumbs} aria-label="breadcrumbs">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          const content = (
            <>
              {crumb.icon ? <span aria-hidden>{crumb.icon}</span> : null}
              <span>{crumb.label}</span>
            </>
          );
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              {i > 0 ? (
                <span className={styles.crumbSep} aria-hidden>
                  ›
                </span>
              ) : null}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className={styles.crumb}>
                  {content}
                </Link>
              ) : (
                <span className={cx(styles.crumb, isLast && styles.current)}>
                  {content}
                </span>
              )}
            </Fragment>
          );
        })}
      </nav>

      <div className={styles.actions}>
        {actions ?? <DefaultActions />}
      </div>
    </header>
  );
}

function DefaultActions() {
  return (
    <>
      <button
        type="button"
        className={cx(styles.iconBtn, styles.hideSm)}
        data-cmdk-trigger=""
        aria-label="검색 (⌘K)"
      >
        🔍
      </button>
    </>
  );
}
