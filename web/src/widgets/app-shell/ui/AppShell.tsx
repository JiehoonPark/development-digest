import type { ReactNode } from "react";

import styles from "./AppShell.module.css";

interface AppShellProps {
  /** 좌측 사이드바 — Sidebar 위젯을 바로 전달. 래퍼 없이 grid 자식으로 배치 */
  sidebar: ReactNode;
  /** 메인 캔버스 */
  children: ReactNode;
  /** 우측 속성 패널. parallel @panel 슬롯에서 주입, 없으면 3번째 컬럼 0 */
  panel?: ReactNode;
}

export function AppShell({ sidebar, children, panel }: AppShellProps) {
  const hasPanel = Boolean(panel);
  return (
    <div
      className={styles.app}
      data-sidebar="expanded"
      data-panel={hasPanel ? "expanded" : "collapsed"}
    >
      {sidebar}
      <main className={styles.main} data-main-scroll>
        {children}
      </main>
      {panel}
    </div>
  );
}
