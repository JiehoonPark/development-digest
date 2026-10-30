const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * KST 기준 YYYY-MM-DD.
 * CI 러너는 UTC 23:00(=KST 08:00)에 돌기 때문에 로컬 시간대 날짜를 쓰면 하루 전 날짜가 된다.
 */
export function formatKstDate(date: Date = new Date()): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  const DAY_MS = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(toIsoDate) - Date.parse(fromIsoDate)) / DAY_MS);
}
