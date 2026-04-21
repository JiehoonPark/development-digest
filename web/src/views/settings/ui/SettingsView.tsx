import { AppearanceTweaks } from "@/features/toggle-theme";
import { PageContainer, PageCover } from "@/shared/ui";
import { EXTERNAL, ROUTES } from "@/shared/config";
import { TopbarAuto } from "@/widgets/topbar";

import styles from "./SettingsView.module.css";

export function SettingsView() {
  return (
    <>
      <TopbarAuto
        crumbs={[
          { label: "Dev Digest", icon: "📬", href: ROUTES.home },
          { label: "설정", icon: "⚙️" },
        ]}
      />
      <PageContainer>
        <PageCover icon="⚙️" title="설정" />

        <section className={styles.section}>
          <h2>외관</h2>
          <AppearanceTweaks />
        </section>

        <section className={styles.section}>
          <h2>단축키</h2>
          <dl className={styles.shortcuts}>
            <dt>
              <span className={styles.kbd}>⌘K</span> / <span className={styles.kbd}>Ctrl+K</span>
            </dt>
            <dd>빠른 검색 (페이지·아티클)</dd>
            <dt>
              <span className={styles.kbd}>⌘\</span> / <span className={styles.kbd}>Ctrl+\</span>
            </dt>
            <dd>사이드바 접기/펴기</dd>
            <dt>
              <span className={styles.kbd}>Esc</span>
            </dt>
            <dd>모달·오버레이 닫기</dd>
          </dl>
        </section>

        <section className={styles.section}>
          <h2>정보</h2>
          <div className={styles.info}>
            <div>Dev Digest — AI가 큐레이션한 프론트엔드 개발 뉴스레터</div>
            <div>
              <a href={EXTERNAL.repo} target="_blank" rel="noopener noreferrer">
                📦 GitHub 저장소
              </a>
            </div>
            <div>
              <a
                href={`https://github.com/${EXTERNAL.feedbackRepo}/issues/new?labels=feedback&title=${encodeURIComponent("피드백: ")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 피드백 보내기
              </a>
            </div>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
