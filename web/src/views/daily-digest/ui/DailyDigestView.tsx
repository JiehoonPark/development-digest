import { notFound } from "next/navigation";

import { countArchiveItems, getArchive } from "@/entities/archive";
import { ArticleBlock } from "@/entities/article";
import { FilterPills } from "@/features/filter-by-label";
import { Callout, PageContainer, PageCover } from "@/shared/ui";
import type { ArchiveData, ArchiveItem } from "@/shared/config";
import { ROUTES } from "@/shared/config";
import { TopbarAuto } from "@/widgets/topbar";

import styles from "./DailyDigestView.module.css";

interface DailyDigestViewProps {
  year: string;
  month: string;
  day: string;
}

export function DailyDigestView({ year, month, day }: DailyDigestViewProps) {
  const date = `${year}-${month}-${day}`;
  const archive = getArchive(date);
  if (!archive) notFound();

  const total = countArchiveItems(archive);
  const items = flattenArchive(archive);

  return (
    <>
      <TopbarAuto
        crumbs={[
          { label: "Dev Digest", icon: "📬", href: ROUTES.home },
          { label: "아카이브", icon: "📚", href: ROUTES.archive },
          { label: archive.date, icon: "📅" },
        ]}
      />
      <PageContainer>
        <PageCover
          icon="📅"
          title={`FE 데일리 리포트 — ${archive.date}`}
          subtitle={`${total}개 아티클`}
        />
        <Callout emoji="✨">{archive.intro}</Callout>
        <FilterPills />
        <div className={styles.list}>
          {items.map((item) => (
            <ArticleBlock key={item.slug} item={item} date={archive.date} />
          ))}
        </div>
      </PageContainer>
    </>
  );
}

function flattenArchive(archive: ArchiveData): ArchiveItem[] {
  const ORDER: Record<string, number> = { hot: 0, tech: 1, insight: 2, video: 3 };
  const sections = [...archive.sections].sort(
    (a, b) => (ORDER[a.category] ?? 99) - (ORDER[b.category] ?? 99)
  );
  return sections.flatMap((s) => s.items);
}
