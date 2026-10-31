/**
 * Dev Digest 로고 — 중괄호 안의 요약 세 줄(코드 + 추려 낸 소식).
 * 64×64 격자 기준. 파비콘(app/icon.svg)과 같은 도형이니 바꿀 때 함께 바꾼다.
 */
const BRAND_ACCENT = "#d97757";
const BRAND_INK = "#111110";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <rect width="64" height="64" rx="16" fill={BRAND_ACCENT} />
      <path
        d="M20 15c-4 0-6 2-6 6v6c0 3-1.5 4.5-4 5c2.5.5 4 2 4 5v6c0 4 2 6 6 6M44 15c4 0 6 2 6 6v6c0 3 1.5 4.5 4 5c-2.5.5-4 2-4 5v6c0 4-2 6-6 6"
        fill="none"
        stroke={BRAND_INK}
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="22" y="22.5" width="20" height="4.6" rx="2.3" fill={BRAND_INK} />
      <rect x="22" y="30" width="15" height="4.6" rx="2.3" fill={BRAND_INK} />
      <rect x="22" y="37.5" width="10" height="4.6" rx="2.3" fill={BRAND_INK} />
    </svg>
  );
}
