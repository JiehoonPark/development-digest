import type { CSSProperties } from "react";

import { cx } from "@/shared/lib";

import { getCategoryMeta } from "../config/category-config";
import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  category: string;
  /** 우측에 개수 뱃지 표시 (옵션) */
  count?: number;
  /** H2 기본, H3 사용 시 지정 */
  level?: 2 | 3;
}

export function SectionHeader({ category, count, level = 2 }: SectionHeaderProps) {
  const meta = getCategoryMeta(category);
  const dotStyle: CSSProperties = { background: `var(${meta.colorVar})` };

  return (
    <h2
      className={cx(styles.h, level === 2 ? styles.h2 : styles.h3)}
      id={`section-${category}`}
    >
      <span className={styles.dot} style={dotStyle} aria-hidden />
      <span className={styles.emoji} aria-hidden>
        {meta.emoji}
      </span>
      <span className={styles.title}>{meta.title}</span>
      {typeof count === "number" ? <span className={styles.count}>{count}</span> : null}
    </h2>
  );
}
