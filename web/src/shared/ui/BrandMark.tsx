/**
 * 로고 — 16칸 픽셀 모니터를 먹색 한 색으로 채운 모양(화면 자리만 비움).
 * 사이트 틀은 무채색으로 두고 색은 리소 커버에만 주기 위해 단색으로 둔다.
 * z1hoon.com 포트폴리오의 CRT 모니터와 한 표시로 묶인다. 파비콘(app/icon.svg)과 같은 도형이니 함께 바꾼다.
 */
const INK = "#232324";
const PAPER = "#ffffff";

/** 16×16 격자의 칸 묶음 [x, y, 폭, 높이] */
const BODY: [number, number, number, number][] = [
  [1, 1, 14, 12], // 몸체
  [4, 13, 8, 1], // 목
  [2, 14, 12, 1], // 받침
];
const HOLES: [number, number, number, number][] = [
  [3, 3, 10, 6], // 화면
  [3, 10.5, 3, 1], // 디스크 슬롯
];

export function BrandMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      {BODY.map(([x, y, w, h]) => (
        <rect key={`b${x},${y}`} x={x} y={y} width={w} height={h} fill={INK} />
      ))}
      {HOLES.map(([x, y, w, h]) => (
        <rect key={`h${x},${y}`} x={x} y={y} width={w} height={h} fill={PAPER} />
      ))}
    </svg>
  );
}
