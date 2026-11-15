"use client";

import { useEffect } from "react";

/** 화면에 이만큼 보이면 재생을 시작한다 */
const VISIBLE_RATIO_TO_PLAY = 0.5;

/**
 * 본문의 시연 영상(`figure.clip video`)을 화면에 보일 때만 재생하고, 벗어나면 멈춘다.
 * 모션 줄이기 설정이면 자동 재생하지 않는다 — 컨트롤로 직접 틀 수 있다.
 */
export function PostClips() {
  useEffect(() => {
    const videos = [...document.querySelectorAll<HTMLVideoElement>("video[data-clip]")];
    if (videos.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.intersectionRatio >= VISIBLE_RATIO_TO_PLAY) {
            video.preload = "auto";
            void video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        }
      },
      { threshold: [0, VISIBLE_RATIO_TO_PLAY] }
    );
    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  return null;
}
