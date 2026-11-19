/**
 * 리소 인쇄 히어로의 하프톤 원 — 중심이 진하고 가장자리로 갈수록 점이 작아지는 원.
 * 서버에서 점 좌표를 한 번 계산해 정적 SVG 로 내보낸다(클라이언트 JS 없음).
 */
export interface HalftoneDot {
  x: number;
  y: number;
  r: number;
}

const DOT_SCALE = 0.62;
const MIN_COVERAGE = 0.05;

export function halftoneDisc(radius: number, cell: number, angleDeg: number): HalftoneDot[] {
  const dots: HalftoneDot[] = [];
  const angle = (angleDeg * Math.PI) / 180;
  const steps = Math.ceil((radius * 1.5) / cell);
  for (let i = -steps; i <= steps; i += 1) {
    for (let j = -steps; j <= steps; j += 1) {
      const gx = i * cell;
      const gy = j * cell;
      const x = gx * Math.cos(angle) - gy * Math.sin(angle);
      const y = gx * Math.sin(angle) + gy * Math.cos(angle);
      const distance = Math.hypot(x, y) / radius;
      if (distance > 1) continue;
      const coverage = 1 - distance ** 1.6;
      if (coverage < MIN_COVERAGE) continue;
      dots.push({ x: round(x), y: round(y), r: round(cell * DOT_SCALE * Math.sqrt(coverage)) });
    }
  }
  return dots;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
