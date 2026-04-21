"use client";

import { useState, useEffect } from "react";

import { KNOWN_LABELS } from "@/entities/label";
import { cx } from "@/shared/lib";

import styles from "./FilterPills.module.css";

/** 필터 탭에서 숨길 라벨 — 데이터·검색 인덱스엔 유지되지만 UI 선택지에선 제외 */
const HIDDEN_FROM_FILTER = new Set<string>(["typescript"]);

/**
 * 선택된 라벨이 "all"이면 모든 아티클 표시, 그 외엔 `data-labels` 속성에 해당 라벨이
 * 포함된 아티클만 표시. data attribute 기반이라 SSR-rendered 콘텐츠를 그대로 숨김.
 */
export function FilterPills() {
  const [active, setActive] = useState<string>("all");

  useEffect(() => {
    const articles = document.querySelectorAll<HTMLElement>("[data-labels]");
    articles.forEach((el) => {
      if (active === "all") {
        el.style.display = "";
        return;
      }
      const labels = (el.dataset.labels ?? "").split(",").filter(Boolean);
      el.style.display = labels.includes(active) ? "" : "none";
    });
  }, [active]);

  const options = ["all", ...KNOWN_LABELS.filter((l) => !HIDDEN_FROM_FILTER.has(l))];
  const display = (l: string) => (l === "all" ? "전체" : l);

  return (
    <div className={styles.row} role="toolbar" aria-label="라벨 필터">
      {options.map((l) => (
        <button
          key={l}
          type="button"
          className={cx(styles.pill, active === l && styles.active)}
          onClick={() => setActive(l)}
          aria-pressed={active === l}
        >
          {display(l)}
        </button>
      ))}
    </div>
  );
}
