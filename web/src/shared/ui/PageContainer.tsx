import type { ReactNode } from "react";

import styles from "./PageContainer.module.css";

/**
 * Notion 페이지 컨테이너 — 중앙 정렬, 가변 패딩, page-in 애니.
 */
export function PageContainer({ children }: { children: ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}
