import { format, subDays, isAfter, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export function formatDigestDate(date: Date = new Date()): string {
  return format(date, "yyyy년 M월 d일 (EEE)", { locale: ko });
}

export function formatISODate(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function isWithinDays(dateStr: string, days: number): boolean {
  const cutoff = subDays(new Date(), days);
  const date = parseISO(dateStr);
  return isAfter(date, cutoff);
}

export function hoursAgo(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}
