/**
 * 1,000 이상이면 "1.2k" 포맷, 미만이면 정수 문자열.
 */
export function formatEngagement(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
