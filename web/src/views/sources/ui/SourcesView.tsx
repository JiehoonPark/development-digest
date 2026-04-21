import { listArchives } from "@/entities/archive";
import { PageContainer, PageCover } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { TopbarAuto } from "@/widgets/topbar";

import styles from "./SourcesView.module.css";

interface SourceStat {
  name: string;
  count: number;
  lastSeen: string;
}

export function SourcesView() {
  const stats = aggregateSources();

  return (
    <>
      <TopbarAuto
        crumbs={[
          { label: "Dev Digest", icon: "📬", href: ROUTES.home },
          { label: "소스 목록", icon: "📡" },
        ]}
      />
      <PageContainer>
        <PageCover
          icon="📡"
          title="소스 목록"
          subtitle={`${stats.length}개 출처 · 최근 아카이브 기준`}
        />

        <div className={styles.grid}>
          {stats.map((s) => (
            <div key={s.name} className={styles.card}>
              <div className={styles.name}>{s.name}</div>
              <div className={styles.meta}>
                {s.count}개 아티클 · 최근 {s.lastSeen}
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </>
  );
}

function aggregateSources(): SourceStat[] {
  const map = new Map<string, { count: number; lastSeen: string }>();
  for (const archive of listArchives()) {
    for (const section of archive.sections) {
      for (const item of section.items) {
        const prev = map.get(item.sourceName);
        if (!prev) {
          map.set(item.sourceName, { count: 1, lastSeen: archive.date });
        } else {
          prev.count += 1;
          if (archive.date > prev.lastSeen) prev.lastSeen = archive.date;
        }
      }
    }
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, count: v.count, lastSeen: v.lastSeen }))
    .sort((a, b) => b.count - a.count);
}
