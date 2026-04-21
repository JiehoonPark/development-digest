"use client";

import { cx } from "@/shared/lib";

import { usePrefs, type Font, type Size, type Theme } from "../model/usePrefs";
import styles from "./AppearanceTweaks.module.css";

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
];

const SIZES: { value: Size; label: string }[] = [
  { value: "small", label: "작게" },
  { value: "default", label: "기본" },
  { value: "large", label: "크게" },
];

const FONTS: { value: Font; label: string }[] = [
  { value: "pretendard", label: "Pretendard" },
  { value: "inter", label: "Inter" },
  { value: "serif", label: "Serif" },
];

const ACCENTS: string[] = [
  "#3182f6", // Toss blue (default)
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
];

export function AppearanceTweaks() {
  const { prefs, update, reset } = usePrefs();

  return (
    <div>
      <Group label="테마">
        <Segment
          options={THEMES}
          value={prefs.theme}
          onChange={(v) => update({ theme: v })}
        />
      </Group>

      <Group label="글자 크기">
        <Segment
          options={SIZES}
          value={prefs.size}
          onChange={(v) => update({ size: v })}
        />
      </Group>

      <Group label="폰트">
        <Segment
          options={FONTS}
          value={prefs.font}
          onChange={(v) => update({ font: v })}
        />
      </Group>

      <Group label="액센트 컬러">
        <div className={styles.swatches} role="radiogroup" aria-label="액센트 컬러">
          {ACCENTS.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={(prefs.accent ?? ACCENTS[0]) === color}
              className={cx(styles.swatch, (prefs.accent ?? ACCENTS[0]) === color && styles.active)}
              style={{ background: color }}
              onClick={() => update({ accent: color })}
              aria-label={color}
            />
          ))}
        </div>
      </Group>

      <div className={styles.row}>
        <label>
          <input
            type="checkbox"
            checked={prefs.reduceMotion ?? false}
            onChange={(e) => update({ reduceMotion: e.target.checked })}
          />
          애니메이션 줄이기
        </label>
      </div>

      <button type="button" className={styles.reset} onClick={reset}>
        기본값으로 초기화
      </button>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.group}>
      <div className={styles.label}>{label}</div>
      {children}
    </div>
  );
}

interface SegmentProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

function Segment<T extends string>({ options, value, onChange }: SegmentProps<T>) {
  return (
    <div className={styles.seg} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={cx(value === o.value && styles.active)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
