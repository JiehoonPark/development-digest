import { getDb } from "../database.js";
import { createChildLogger } from "../../utils/logger.js";

const log = createChildLogger("recent-titles");

/**
 * 제목을 dedup 가능한 키로 정규화.
 * 소문자 + 유니코드 외 문자(구두점/이모지) 제거 + 공백 정리.
 *
 * 예: "React Server Components의 중대 보안 취약점 (CVE-2025)" →
 *     "react server components의 중대 보안 취약점 cve 2025"
 */
export function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 주어진 key 집합 중 최근 3일 이내 이미 다룬 것들만 돌려준다 (미리 batch 조회).
 */
export function getRecentTitleKeys(keys: string[]): Set<string> {
  if (keys.length === 0) return new Set();
  const db = getDb();
  const placeholders = keys.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT title_hash FROM recent_story_titles
       WHERE title_hash IN (${placeholders})
         AND expires_at > datetime('now')`
    )
    .all(...keys) as Array<{ title_hash: string }>;
  return new Set(rows.map((r) => r.title_hash));
}

/**
 * 최근 N 일 이내 다룬 실제 제목들. FILTER_PROMPT 에 "이미 다룬 주제" 컨텍스트로 주입.
 */
export function getRecentTitles(limit = 100): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT title FROM recent_story_titles
       WHERE expires_at > datetime('now')
       ORDER BY first_seen_at DESC
       LIMIT ?`
    )
    .all(limit) as Array<{ title: string }>;
  return rows.map((r) => r.title);
}

/**
 * 오늘 다룬 아이템들의 정규화 제목을 저장. 만료는 SQL DEFAULT 가 3일 뒤로 설정.
 * INSERT OR REPLACE 로 같은 제목이 들어와도 expires_at 을 갱신.
 */
export function markTitlesRecent(items: Array<{ key: string; title: string }>): void {
  if (items.length === 0) return;
  const db = getDb();
  const insert = db.prepare(
    `INSERT OR REPLACE INTO recent_story_titles (title_hash, title, expires_at)
     VALUES (?, ?, datetime('now', '+3 days'))`
  );
  const tx = db.transaction(() => {
    for (const item of items) insert.run(item.key, item.title);
  });
  tx();
}

export function cleanExpiredTitles(): void {
  const db = getDb();
  const result = db
    .prepare(`DELETE FROM recent_story_titles WHERE expires_at < datetime('now')`)
    .run();
  if (result.changes > 0) {
    log.info({ deleted: result.changes }, "만료된 recent title 정리");
  }
}
