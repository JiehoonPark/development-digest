import Link from "next/link";

import { countArchiveItems, listArchives } from "@/entities/archive";
import { PageContainer, PageCover } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { TopbarAuto } from "@/widgets/topbar";

import styles from "./ArchiveView.module.css";

export function ArchiveView() {
  const archives = listArchives();

  return (
    <>
      <TopbarAuto
        crumbs={[
          { label: "Dev Digest", icon: "📬", href: ROUTES.home },
          { label: "아카이브", icon: "📚" },
        ]}
      />
      <PageContainer>
        <PageCover
          icon="📚"
          title="전체 아카이브"
          subtitle={`${archives.length}개 다이제스트`}
        />

        <div className={styles.tabs} role="tablist" aria-label="아카이브 보기">
          <button type="button" className={`${styles.tab} ${styles.active}`} role="tab" aria-selected>
            📋 테이블
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">날짜</th>
              <th scope="col">아티클</th>
              <th scope="col">섹션</th>
              <th scope="col">인트로</th>
            </tr>
          </thead>
          <tbody>
            {archives.map((archive) => {
              const [year, month, day] = archive.date.split("-");
              const total = countArchiveItems(archive);
              return (
                <tr key={archive.date}>
                  <td className={styles.titleCell}>
                    <Link href={ROUTES.dailyDigest(year, month, day)}>
                      <span className={styles.rowIcon} aria-hidden>
                        📅
                      </span>
                      {archive.date}
                    </Link>
                  </td>
                  <td>{total}개</td>
                  <td>{archive.sections.length}개</td>
                  <td style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {archive.intro}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PageContainer>
    </>
  );
}
