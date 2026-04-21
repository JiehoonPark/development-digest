"use client";

import { useEffect, useState } from "react";

/**
 * AppShell의 `<main data-main-scroll>` 컨테이너의 스크롤을 감지한다.
 * Topbar가 그 안에서 sticky로 떠있으므로, 이 컨테이너 스크롤 값을 기준으로 판단해야 함.
 */
export function useScrollShadow(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>("[data-main-scroll]");
    if (!el) return;

    const onScroll = () => setScrolled(el.scrollTop > threshold);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
