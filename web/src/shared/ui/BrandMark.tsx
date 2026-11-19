/**
 * 로고 — 리소 인쇄의 맞춤표(registration mark). 분홍 판과 파랑 판을 살짝 어긋나게 겹쳐 찍은 모양이라
 * 커버 그림(2도 잉크·판 어긋남)과 같은 말을 한다. 64×64 격자. 파비콘(app/icon.svg)과 같은 도형이니 함께 바꾼다.
 */
const INK_PINK = "#ee4fa3";
const INK_BLUE = "#2f3f9e";
const PAPER = "#f3eee3";
const PINK_OFFSET = { x: 2.5, y: 2 };

interface BrandMarkProps {
  size?: number;
  className?: string;
}

function RegistrationMark({ color, dx = 0, dy = 0 }: { color: string; dx?: number; dy?: number }) {
  return (
    <g
      transform={`translate(${dx} ${dy})`}
      stroke={color}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      style={{ mixBlendMode: "multiply" }}
    >
      <circle cx="32" cy="32" r="13" />
      <path d="M32 9v46M9 32h46" />
    </g>
  );
}

export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <rect width="64" height="64" rx="14" fill={PAPER} />
      <RegistrationMark color={INK_PINK} dx={PINK_OFFSET.x} dy={PINK_OFFSET.y} />
      <RegistrationMark color={INK_BLUE} />
    </svg>
  );
}
