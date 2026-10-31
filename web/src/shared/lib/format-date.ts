const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-10-29" → "2026년 10월 29일 (목)" */
export function formatKoreanDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

/** "2026-10-29" → "10월 29일" */
export function formatShortKoreanDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${month}월 ${day}일`;
}
