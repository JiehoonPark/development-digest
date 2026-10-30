import { notFound } from "next/navigation";

import { countArchiveItems, getArchive, listVisibleItems } from "@/entities/archive";
import { ArticleBlock } from "@/entities/article";
import { FilterPills } from "@/features/filter-by-label";
import { PageContainer, PageCover } from "@/shared/ui";
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
  const items = listVisibleItems(archive);

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
