import { formatISODate } from "../utils/date.js";

/** KST 기준 YYYY-MM-DD — 다이제스트 발행일과 같은 함수를 써서 글 날짜와 어긋나지 않게 한다 */
export function formatKstDate(date: Date = new Date()): string {
  return formatISODate(date);
}

export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  const DAY_MS = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(toIsoDate) - Date.parse(fromIsoDate)) / DAY_MS);
}
