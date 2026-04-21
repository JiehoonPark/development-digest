import type { ReactNode } from "react";

import { cx } from "@/shared/lib";

import styles from "./Callout.module.css";

interface CalloutProps {
  emoji?: string;
  /** accent: Notion-style 파란 강조 콜아웃 (why-it-matters 용) */
  variant?: "default" | "accent";
  children: ReactNode;
}

export function Callout({ emoji = "💡", variant = "default", children }: CalloutProps) {
  return (
    <div className={cx(styles.callout, variant === "accent" && styles.accent)}>
      <span className={styles.emoji} aria-hidden>
        {emoji}
      </span>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
