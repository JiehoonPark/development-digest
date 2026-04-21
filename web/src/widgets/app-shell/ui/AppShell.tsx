import type { ReactNode } from "react";

import styles from "./AppShell.module.css";

interface AppShellProps {
  /** 좌측 사이드바 — Sidebar 위젯을 바로 전달 */
  sidebar: ReactNode;
  /** 메인 캔버스 */
  children: ReactNode;
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className={styles.app} data-sidebar="expanded">
      {sidebar}
      <main className={styles.main} data-main-scroll>
        {children}
      </main>
    </div>
  );
}
