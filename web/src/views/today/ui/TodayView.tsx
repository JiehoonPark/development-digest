import { getLatestArchive, countArchiveItems, listVisibleItems } from "@/entities/archive";
import { ArticleBlock } from "@/entities/article";
import { FilterPills } from "@/features/filter-by-label";
import { Callout, PageContainer, PageCover } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { TopbarAuto } from "@/widgets/topbar";

import styles from "./TodayView.module.css";

export function TodayView() {
  const archive = getLatestArchive();

  if (!archive) {
    return (
      <>
        <TopbarAuto
          crumbs={[
            { label: "Dev Digest", icon: "📬", href: ROUTES.home },
            { label: "오늘의 다이제스트", icon: "📅" },
          ]}
        />
        <PageContainer>
          <PageCover icon="📅" title="오늘의 다이제스트" />
          <Callout emoji="🗂">
            아직 수집된 아카이브가 없습니다. 파이프라인을 1회 이상 실행해 주세요.
          </Callout>
        </PageContainer>
      </>
    );
  }

  const total = countArchiveItems(archive);
  const items = listVisibleItems(archive);

  return (
    <>
      <TopbarAuto
        crumbs={[
          { label: "Dev Digest", icon: "📬", href: ROUTES.home },
          { label: `${archive.date}`, icon: "📅" },
        ]}
      />
      <PageContainer>
        <PageCover
          icon="📬"
          title={`FE 데일리 리포트 — ${archive.date}`}
          subtitle={`${total}개 아티클 · AI가 큐레이션한 프론트엔드 개발 뉴스`}
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
