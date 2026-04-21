import type { ReactNode } from "react";

import styles from "./PropertyPanel.module.css";

export interface PropertyRow {
  key: string;
  /** 값 렌더 — string 또는 뱃지 묶음 */
  value: ReactNode;
}

export interface PropertyGroup {
  title: string;
  rows: PropertyRow[];
}

interface PropertyPanelProps {
  groups: PropertyGroup[];
  /** 우측 패널 하단에 붙일 추가 노드 (예: 목차) */
  footer?: ReactNode;
}

export function PropertyPanel({ groups, footer }: PropertyPanelProps) {
  if (groups.length === 0 && !footer) {
    return (
      <aside className={styles.panel}>
        <div className={styles.inner}>
          <p className={styles.empty}>표시할 속성이 없습니다.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.panel} aria-label="페이지 속성">
      <div className={styles.inner}>
        {groups.map((group, gi) => (
          <div key={group.title}>
            {gi > 0 ? <div className={styles.divider} /> : null}
            <div className={styles.title}>{group.title}</div>
            {group.rows.map((row) => (
              <div key={row.key} className={styles.row}>
                <div className={styles.key}>{row.key}</div>
                <div className={styles.val}>{row.value}</div>
              </div>
            ))}
          </div>
        ))}
        {footer ? (
          <>
            {groups.length > 0 ? <div className={styles.divider} /> : null}
            {footer}
          </>
        ) : null}
      </div>
    </aside>
  );
}
