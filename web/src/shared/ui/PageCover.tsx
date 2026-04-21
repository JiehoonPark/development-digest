import styles from "./PageCover.module.css";

interface PageCoverProps {
  /** 큰 페이지 아이콘 (이모지) */
  icon: string;
  title: string;
  subtitle?: string;
}

/**
 * Notion 스타일 페이지 헤더 — 그라디언트 커버 + 큰 이모지 + H1 타이틀.
 * 레이아웃 컨테이너는 호출자 책임 (`<div class="page">` 등으로 감쌀 것).
 */
export function PageCover({ icon, title, subtitle }: PageCoverProps) {
  return (
    <>
      <div className={styles.cover} aria-hidden />
      <div className={styles.iconWrap}>
        <span className={styles.icon} role="img">
          {icon}
        </span>
      </div>
      <h1 className={styles.title}>{title}</h1>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </>
  );
}
