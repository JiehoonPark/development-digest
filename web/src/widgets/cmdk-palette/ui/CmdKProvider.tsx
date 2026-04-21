"use client";

import { useCallback, useEffect, useState } from "react";

import { CmdKPalette } from "./CmdKPalette";

/**
 * 전역 ⌘K/Ctrl+K/Esc 단축키, `data-cmdk-trigger` 클릭을 듣고 팔레트를 여닫는다.
 * 앱 루트 레이아웃에 한 번 붙여두면 어디서든 검색 호출 가능.
 */
export function CmdKProvider() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const trigger = target.closest("[data-cmdk-trigger]");
      if (trigger) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <CmdKPalette open={open} onClose={close} />;
}
