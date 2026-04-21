"use client";

import { useState, type ReactNode } from "react";

import { cx } from "@/shared/lib";

import styles from "./ToggleBlock.module.css";

interface ToggleBlockProps {
  /** 토글 헤더 — 보통 섹션 타이틀 (이모지 + 제목 + 개수) */
  heading: ReactNode;
  /** 기본적으로 펼쳐져 있는지 여부 */
  defaultOpen?: boolean;
  children: ReactNode;
}

export function ToggleBlock({ heading, defaultOpen = true, children }: ToggleBlockProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={styles.toggle}>
      <button
        type="button"
        className={styles.head}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className={cx(styles.triangle, open && styles.open)} aria-hidden>
          ▶
        </span>
        {heading}
      </button>
      <div className={cx(styles.body, open ? styles.open : styles.closed)}>
        {children}
      </div>
    </section>
  );
}
