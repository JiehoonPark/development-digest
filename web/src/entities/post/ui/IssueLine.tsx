import { formatDotDate, formatIssue } from "../lib/issue";

import styles from "./IssueLine.module.css";

interface IssueLineProps {
  issue: number;
  date: string;
  tags?: string[];
  /** 앞에 붙는 말(예: "오늘의 글") */
  label?: string;
}

/** 터미널 프롬프트처럼 한 줄로 쓰는 글 메타: no.017 — 2026.04.21 — react · compiler */
export function IssueLine({ issue, date, tags = [], label }: IssueLineProps) {
  return (
    <p className={styles.line}>
      <span className={styles.prompt} aria-hidden>
        [/&gt;
      </span>
      {label && <span className={styles.label}>{label}</span>}
      <span className={styles.issue}>{formatIssue(issue)}</span>
      <span className={styles.sep} aria-hidden>—</span>
      <time dateTime={date}>{formatDotDate(date)}</time>
      {tags.length > 0 && (
        <>
          <span className={styles.sep} aria-hidden>—</span>
          <span>{tags.map((tag) => tag.toLowerCase()).join(" · ")}</span>
        </>
      )}
    </p>
  );
}
