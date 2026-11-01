"use client";

import { useState } from "react";

import { DemoFrame } from "./DemoFrame";
import styles from "./Demos.module.css";

/** 슬라이더 범위 — 경계 768px 앞뒤 2px, 브라우저 확대·축소에서 생기는 소수 너비까지 */
const WIDTH_RANGE = { min: 766, max: 770, step: 0.01 } as const;
const PRESETS = [767, 767.98, 767.99, 768, 768.5];

interface Strategy {
  name: string;
  note: string;
  mobile: { label: string; matches: (width: number) => boolean };
  desktop: { label: string; matches: (width: number) => boolean };
}

/** 본문에서 다룬 세 가지 경계 쓰기 — 조건식은 미디어 쿼리 의미 그대로 */
const STRATEGIES: Strategy[] = [
  {
    name: "같은 숫자",
    note: "min/max 모두 768px",
    mobile: { label: "max-width: 768px", matches: (w) => w <= 768 },
    desktop: { label: "min-width: 768px", matches: (w) => w >= 768 },
  },
  {
    name: "0.02px 빼기",
    note: "Bootstrap 방식",
    mobile: { label: "max-width: 767.98px", matches: (w) => w <= 767.98 },
    desktop: { label: "min-width: 768px", matches: (w) => w >= 768 },
  },
  {
    name: "범위 문법",
    note: "미디어 쿼리 레벨 4",
    mobile: { label: "width < 768px", matches: (w) => w < 768 },
    desktop: { label: "width >= 768px", matches: (w) => w >= 768 },
  },
];

type Verdict = "ok" | "overlap" | "gap";

const VERDICT_LABELS: Record<Verdict, string> = { ok: "하나만 적용", overlap: "둘 다 적용", gap: "아무것도 없음" };

function judge(mobile: boolean, desktop: boolean): Verdict {
  if (mobile && desktop) return "overlap";
  if (!mobile && !desktop) return "gap";
  return "ok";
}

/** 화면 너비를 소수점 단위로 움직이며 세 방식의 경계가 어떻게 겹치거나 비는지 본다 */
export function MediaQueryGapDemo() {
  const [width, setWidth] = useState(767.99);

  return (
    <DemoFrame title="경계값 768px 근처를 0.01px씩" hint="슬라이더를 움직이거나 값을 눌러 보세요">
      <div className={styles.controls}>
        <output className={styles.width}>{width.toFixed(2)}px</output>
      </div>
      <input
        className={styles.slider}
        type="range"
        min={WIDTH_RANGE.min}
        max={WIDTH_RANGE.max}
        step={WIDTH_RANGE.step}
        value={width}
        onChange={(event) => setWidth(Number(event.target.value))}
        aria-label="화면 너비(px)"
      />
      <div className={styles.controls} style={{ marginTop: 10 }}>
        {PRESETS.map((preset) => (
          <button key={preset} type="button" className={styles.button} aria-pressed={width === preset} onClick={() => setWidth(preset)}>
            {preset}
          </button>
        ))}
      </div>

      <div className={styles.strategies}>
        {STRATEGIES.map((strategy) => {
          const mobile = strategy.mobile.matches(width);
          const desktop = strategy.desktop.matches(width);
          const verdict = judge(mobile, desktop);
          return (
            <div key={strategy.name} className={styles.strategy}>
              <span className={styles.strategyName}>
                {strategy.name}
                <small>{strategy.note}</small>
              </span>
              <span className={styles.rule} data-on={mobile}>
                {strategy.mobile.label}
              </span>
              <span className={styles.rule} data-on={desktop}>
                {strategy.desktop.label}
              </span>
              <span className={styles.verdict} data-state={verdict}>
                {VERDICT_LABELS[verdict]}
              </span>
            </div>
          );
        })}
      </div>
    </DemoFrame>
  );
}
