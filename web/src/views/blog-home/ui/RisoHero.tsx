import { SITE } from "@/shared/config";

import { halftoneDisc } from "../lib/halftone";
import styles from "./RisoHero.module.css";

/**
 * 홈 머리말 — 커버와 같은 리소 인쇄 말투(크림 종이 · 분홍/파랑 두 잉크 · 판 어긋남).
 * 두 잉크의 하프톤 원이 천천히 떠다니며 겹쳤다 벌어지고, 이름은 분홍 판이 조금씩 어긋나게 찍힌다.
 * 움직임은 CSS 반복 애니메이션뿐이고, 모션 줄이기 설정이면 멈춘 한 장면으로 보인다.
 */
const BLUE_DISC = halftoneDisc(132, 11, 15);
const PINK_DISC = halftoneDisc(112, 10, 75);

function Disc({ dots, className }: { dots: ReturnType<typeof halftoneDisc>; className: string }) {
  return (
    <svg className={className} viewBox="-150 -150 300 300" aria-hidden focusable="false">
      {dots.map((dot) => (
        <circle key={`${dot.x},${dot.y}`} cx={dot.x} cy={dot.y} r={dot.r} />
      ))}
    </svg>
  );
}

export function RisoHero({ postCount }: { postCount: number }) {
  return (
    <header className={styles.hero}>
      <div className={styles.plates} aria-hidden>
        <Disc dots={BLUE_DISC} className={styles.blue} />
        <Disc dots={PINK_DISC} className={styles.pink} />
      </div>
      <div className={styles.text}>
        <h1 className={styles.name} data-text={SITE.name}>
          {SITE.name}
        </h1>
        <p className={styles.tagline}>{SITE.tagline}</p>
        <p className={styles.count}>지금까지 {postCount}편</p>
      </div>
      <svg className={styles.grain} aria-hidden focusable="false">
        <filter id="riso-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7" />
          <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0.35 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#riso-grain)" />
      </svg>
    </header>
  );
}
