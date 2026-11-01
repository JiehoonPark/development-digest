import type { PostData } from "@/shared/config";

const ISSUE_DIGITS = 3;

/**
 * 호수(No.) — 가장 먼저 발행된 글이 1호. 발행일 오름차순, 같은 날이면 slug 순.
 * 글을 지우지 않는 한 번호가 바뀌지 않는다(과거 날짜로 글을 더하면 뒤 번호가 밀린다).
 */
export function getIssueNumbers(posts: PostData[]): Map<string, number> {
  const chronological = [...posts].sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
  return new Map(chronological.map((post, index) => [post.slug, index + 1]));
}

/** 17 → "no.017" */
export function formatIssue(issue: number): string {
  return `no.${String(issue).padStart(ISSUE_DIGITS, "0")}`;
}

/** "2026-04-21" → "2026.04.21" */
export function formatDotDate(isoDate: string): string {
  return isoDate.replaceAll("-", ".");
}
