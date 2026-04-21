"use client";

import { cx } from "@/shared/lib";

import { usePrefs, type Theme } from "../model/usePrefs";
import styles from "./ThemeToggle.module.css";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
];

export function ThemeToggle() {
  const { prefs, update } = usePrefs();
  return (
    <div className={styles.seg} role="radiogroup" aria-label="테마">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={prefs.theme === o.value}
          onClick={() => update({ theme: o.value })}
          className={cx(prefs.theme === o.value && styles.active)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
