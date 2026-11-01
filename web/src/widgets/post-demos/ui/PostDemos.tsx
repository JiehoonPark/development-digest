"use client";

import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";

import { AnimationThreadDemo } from "./AnimationThreadDemo";
import { CascadeLayerDemo } from "./CascadeLayerDemo";
import { DateRangeDemo } from "./DateRangeDemo";
import { MediaQueryGapDemo } from "./MediaQueryGapDemo";

/** 본문의 ```demo 블록 이름 → 데모 컴포넌트. 새 데모는 여기에 등록한다 */
const DEMOS: Record<string, ComponentType> = {
  "media-query-gap": MediaQueryGapDemo,
  "date-range": DateRangeDemo,
  "animation-thread": AnimationThreadDemo,
  "cascade-layers": CascadeLayerDemo,
};

interface DemoSlot {
  element: HTMLElement;
  Demo: ComponentType;
}

/**
 * 본문 HTML(정적 렌더) 안의 `<div class="demo" data-demo="이름">` 자리에 데모를 끼워 넣는다.
 * 본문은 빌드할 때 문자열로 만들어지므로, 브라우저에서 자리를 찾아 portal 로 그린다.
 */
export function PostDemos() {
  const [slots, setSlots] = useState<DemoSlot[]>([]);

  useEffect(() => {
    const found: DemoSlot[] = [];
    for (const element of document.querySelectorAll<HTMLElement>("[data-demo]")) {
      const Demo = DEMOS[element.dataset.demo ?? ""];
      if (!Demo) {
        // 등록되지 않은 이름 — "자바스크립트를 켜면 보입니다" 안내가 남지 않게 자리째 숨긴다
        element.hidden = true;
        continue;
      }
      element.replaceChildren();
      found.push({ element, Demo });
    }
    setSlots(found);
  }, []);

  return (
    <>
      {slots.map(({ element, Demo }) => createPortal(<Demo />, element, element.dataset.demo))}
    </>
  );
}
