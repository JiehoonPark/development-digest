"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { DemoFrame } from "./DemoFrame";
import styles from "./Demos.module.css";

const HALF_PERIOD_MS = 1000;
const BLOCK_OPTIONS_MS = [300, 800, 1500];
const BALL_SIZE = 32;
const TRACK_PADDING = 6;

/** 본문 예제 그대로 — 끝날 때까지 메인 스레드를 붙잡는다 */
function blockMainThread(durationMs: number) {
  const end = performance.now() + durationMs;
  while (performance.now() < end) {
    // 이 동안 메인 스레드는 다른 일을 못 함
  }
}

/** 같은 왕복 운동을 CSS transform 과 requestAnimationFrame 으로 나란히 돌리고, 메인 스레드를 일부러 막아 본다 */
export function AnimationThreadDemo() {
  const trackRef = useRef<HTMLDivElement>(null);
  const jsBallRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const [lastBlock, setLastBlock] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setTravel(track.clientWidth - BALL_SIZE - TRACK_PADDING * 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ball = jsBallRef.current;
    if (!ball || travel <= 0) return;
    let frame = 0;
    const step = (timestamp: number) => {
      // 경과 시간으로 위치를 구한다(프레임 수로 세면 주사율에 따라 속도가 달라진다)
      const phase = (timestamp % (HALF_PERIOD_MS * 2)) / HALF_PERIOD_MS;
      const progress = phase <= 1 ? phase : 2 - phase;
      const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
      ball.style.transform = `translateX(${eased * travel}px)`;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [travel]);

  const block = (durationMs: number) => {
    setLastBlock(durationMs);
    // 상태가 화면에 먼저 그려진 뒤에 막는다
    requestAnimationFrame(() => setTimeout(() => blockMainThread(durationMs), 50));
  };

  return (
    <DemoFrame title="메인 스레드를 막으면 누가 멈출까" hint="버튼을 누르는 동안 두 공을 보세요">
      <div className={styles.controls}>
        {BLOCK_OPTIONS_MS.map((duration) => (
          <button key={duration} type="button" className={`${styles.button} ${styles.primary}`} onClick={() => block(duration)}>
            {duration}ms 막기
          </button>
        ))}
        {lastBlock && (
          <span className={styles.readout}>
            방금 <strong className={styles.blocked}>{lastBlock}ms</strong> 동안 메인 스레드를 막음
          </span>
        )}
      </div>
      <div className={styles.tracks} style={{ "--travel": `${travel}px` } as CSSProperties}>
        <div>
          <p className={styles.trackLabel}>CSS animation · transform</p>
          <div className={styles.track} ref={trackRef}>
            <div className={`${styles.ball} ${styles.cssBall}`} />
          </div>
        </div>
        <div>
          <p className={styles.trackLabel}>JS requestAnimationFrame</p>
          <div className={styles.track}>
            <div className={`${styles.ball} ${styles.jsBall}`} ref={jsBallRef} />
          </div>
        </div>
      </div>
      <p className={styles.readout} style={{ marginTop: 14 }}>
        같은 1초 왕복입니다. 막는 동안 JS 공은 멈췄다가 순간이동하고, transform 만 움직이는 CSS 공은 대개 계속 움직입니다.
      </p>
    </DemoFrame>
  );
}
