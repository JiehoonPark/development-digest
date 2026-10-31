import type { PostCover as PostCoverData } from "@/shared/config";
import { withBasePath } from "@/shared/lib";

import styles from "./PostCover.module.css";

interface PostCoverProps {
  cover?: PostCoverData;
  /** 화면 위쪽에 바로 보이는 이미지는 eager */
  priority?: boolean;
  variant?: "wide" | "card";
  /** 썸네일 오른쪽 위에 겹쳐 표시하는 주제 배지 */
  badge?: string;
}

/** 커버 이미지. 생성 실패로 없으면 같은 비율의 빈 면을 그려 레이아웃이 흔들리지 않게 한다. */
export function PostCover({ cover, priority = false, variant = "wide", badge }: PostCoverProps) {
  return (
    <div className={`${styles.frame} ${styles[variant]}`}>
      {cover ? (
        // 정적 export + 외부 생성 이미지라 next/image 최적화를 쓰지 않는다
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.image}
          src={withBasePath(cover.src)}
          alt={cover.alt}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className={styles.empty} aria-hidden />
      )}
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
