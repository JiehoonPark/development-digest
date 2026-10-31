import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/shared/config";
import { BrandMark } from "@/shared/ui";

import styles from "./BlogShell.module.css";

/** 심층 글 영역의 상단 바 + 스크롤 컨테이너. 다이제스트 영역의 사이드바 셸과 분리한다. */
export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#content">
        본문으로 건너뛰기
      </a>
      <header className={styles.bar}>
        <Link href={ROUTES.home} className={styles.brand} aria-label="Dev Digest 홈">
          <BrandMark size={30} />
          <span className={styles.brandText}>Dev Digest</span>
        </Link>
        <nav aria-label="주요 메뉴" className={styles.nav}>
          <Link href={ROUTES.home}>글</Link>
          <Link href={ROUTES.digestToday}>지난 다이제스트</Link>
        </nav>
      </header>
      <div id="content">{children}</div>
      <div className={styles.bottomSpace} aria-hidden />
    </div>
  );
}
