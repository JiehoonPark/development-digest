import type { ReactNode } from "react";

import styles from "./AppShell.module.css";

interface AppShellProps {
  /** 좌측 사이드바 슬롯. app 레이어가 Sidebar widget을 주입 */
  sidebar: ReactNode;
  /** 메인 캔버스 — 각 view가 여기 들어감 (topbar는 뷰 내부) */
  children: ReactNode;
  /** 우측 속성 패널. parallel route `@panel` 에서 주입되며 없으면 3번째 컬럼 접힘 */
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
      <div className={styles.sidebarSlot}>{sidebar}</div>
      <main className={styles.main} data-main-scroll>
        {children}
      </main>
      {hasPanel ? <div className={styles.panelSlot}>{panel}</div> : null}
    </div>
  );
}
