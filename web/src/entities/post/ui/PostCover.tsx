import type { PostCover as PostCoverData } from "@/shared/config";
import { withBasePath } from "@/shared/lib";

import { CoverMotion } from "./CoverMotion";
import styles from "./PostCover.module.css";

interface PostCoverProps {
  cover?: PostCoverData;
  /** 화면 위쪽에 바로 보이는 이미지는 eager */
  priority?: boolean;
  variant?: "wide" | "card";
  /** 썸네일 오른쪽 위에 겹쳐 표시하는 주제 배지 */
  badge?: string;
}

/**
 * 커버 이미지. 그림 판(종이 + 먹 그림) 위에 제목만 찍힌 글자 판을 고정해 겹친다.
 * 일부 커버는 그림 판으로 포인트 하나만 움직이는 짧은 반복 영상(예: 열쇠 구멍 너머 눈이 천천히 깜빡임)을 쓰고,
 * 모션 줄이기면 정지 그림을 보여 준다.
 * 생성 실패로 커버가 없으면 같은 비율의 빈 면을 그려 레이아웃이 흔들리지 않게 한다.
 */
export function PostCover({ cover, priority = false, variant = "wide", badge }: PostCoverProps) {
  const loading = priority ? "eager" : "lazy";
  return (
    <div className={`${styles.frame} ${styles[variant]}`}>
      {/* 정적 export + 외부 생성 이미지라 next/image 최적화를 쓰지 않는다 */}
      {cover?.layers ? (
        <>
          {cover.layers.motion ? (
            <CoverMotion src={withBasePath(cover.layers.motion)} poster={withBasePath(cover.layers.art)} label={cover.alt} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.image} src={withBasePath(cover.layers.art)} alt={cover.alt} loading={loading} />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.text} src={withBasePath(cover.layers.text)} alt="" aria-hidden loading={loading} />
        </>
      ) : cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.image} src={withBasePath(cover.src)} alt={cover.alt} loading={loading} />
      ) : (
        <div className={styles.empty} aria-hidden />
      )}
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
