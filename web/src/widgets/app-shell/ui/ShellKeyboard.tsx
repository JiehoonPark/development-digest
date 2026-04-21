"use client";

import { useEffect } from "react";

/**
 * 앱 셸 레벨 단축키.
 * ⌘\ (또는 Ctrl+\) 사이드바 접기/펴기 — `<div.app data-sidebar="...">` 토글.
 */
export function ShellKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        const app = document.querySelector<HTMLElement>('[data-sidebar]');
        if (!app) return;
        app.dataset.sidebar = app.dataset.sidebar === "expanded" ? "collapsed" : "expanded";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
