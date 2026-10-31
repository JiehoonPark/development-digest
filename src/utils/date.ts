import { subDays, isAfter, parseISO } from "date-fns";

/**
 * 발행일은 항상 한국 시간 기준이다.
 * CI 러너는 UTC 23:00(=KST 08:00)에 돌기 때문에 러너 시간대로 포맷하면 하루 전 날짜가 된다.
 */
const DIGEST_TIME_ZONE = "Asia/Seoul";

export function formatDigestDate(date: Date = new Date()): string {
  const parts = kstDateParts(date);
  return `${parts.year}년 ${Number(parts.month)}월 ${Number(parts.day)}일 (${parts.weekday})`;
}

export function formatISODate(date: Date = new Date()): string {
  const parts = kstDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

const KST_WEEKDAY_INDEX: Record<string, number> = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 };

/** KST 요일(0=일요일). `Date#getDay()` 는 러너 시간대를 따라 CI(UTC)에서 하루 어긋난다 */
export function getKstWeekday(date: Date = new Date()): number {
  return KST_WEEKDAY_INDEX[kstDateParts(date).weekday];
}

function kstDateParts(date: Date): Record<string, string> {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: DIGEST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  return Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));
}

export function isWithinDays(dateStr: string, days: number): boolean {
  const cutoff = subDays(new Date(), days);
  const date = parseISO(dateStr);
  return isAfter(date, cutoff);
}

export function hoursAgo(date: Date, now: Date = new Date()): number {
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
}
