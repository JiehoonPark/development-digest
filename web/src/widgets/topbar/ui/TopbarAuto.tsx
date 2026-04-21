"use client";

import type { ReactNode } from "react";

import { Topbar, type Crumb } from "./Topbar";
import { useScrollShadow } from "../model/useScrollShadow";

interface TopbarAutoProps {
  crumbs: Crumb[];
  actions?: ReactNode;
}

/**
 * 스크롤 shadow를 스스로 감지하는 편의 래퍼. 대부분의 뷰에서 이걸 쓰면 된다.
 */
export function TopbarAuto(props: TopbarAutoProps) {
  const scrolled = useScrollShadow();
  return <Topbar {...props} scrolled={scrolled} />;
}
