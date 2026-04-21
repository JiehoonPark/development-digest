"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type Size = "small" | "default" | "large";
export type Font = "pretendard" | "inter" | "serif";

export interface Prefs {
  theme: Theme;
  size: Size;
  font: Font;
  accent?: string;
  reduceMotion?: boolean;
}

const STORAGE_KEY = "devdigest.prefs";

const DEFAULT_PREFS: Prefs = {
  theme: "system",
  size: "default",
  font: "pretendard",
  accent: undefined,
  reduceMotion: false,
};

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyToDocument(prefs: Prefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(prefs.theme);
  root.dataset.size = prefs.size;
  root.dataset.font = prefs.font;
  if (prefs.accent) root.style.setProperty("--accent", prefs.accent);
  if (prefs.reduceMotion) root.dataset.reduceMotion = "true";
  else delete root.dataset.reduceMotion;
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    applyToDocument(prefs);
  }, [prefs]);

  // system theme 변경 감지
  useEffect(() => {
    if (prefs.theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyToDocument(prefs);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs]);

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 스토리지 차단 환경 — 무시
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setPrefs(DEFAULT_PREFS);
  }, []);

  return { prefs, update, reset };
}
