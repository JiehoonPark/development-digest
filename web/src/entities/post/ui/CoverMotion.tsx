"use client";

import { useEffect, useRef } from "react";

import styles from "./PostCover.module.css";

/**
 * 커버 그림 판의 짧은 반복 영상(포인트 하나만 움직임). 화면에 보일 때만 재생하고, 모션 줄이기면 재생하지 않는다.
 * 재생 전·모션 줄이기에서는 같은 그림의 정지 판(poster)이 보인다.
 */
export function CoverMotion({ src, poster, label }: { src: string; poster: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={styles.image}
      src={src}
      poster={poster}
      aria-label={label}
      role="img"
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
