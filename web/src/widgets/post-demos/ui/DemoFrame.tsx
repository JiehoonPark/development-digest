import type { ReactNode } from "react";

import styles from "./DemoFrame.module.css";

interface DemoFrameProps {
  title: string;
  hint: string;
  children: ReactNode;
}

/** 모든 데모가 같은 틀: 위쪽 터미널식 제목 줄 + 조작 안내 */
export function DemoFrame({ title, hint, children }: DemoFrameProps) {
  return (
    <figure className={styles.frame}>
      <figcaption className={styles.bar}>
        <span className={styles.tag}>DEMO</span>
        <span className={styles.title}>{title}</span>
        <span className={styles.hint}>{hint}</span>
      </figcaption>
      <div className={styles.body}>{children}</div>
    </figure>
  );
}
