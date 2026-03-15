import { getDb } from "../database.js";

export function isUrlSeen(url: string): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT 1 FROM seen_urls WHERE url = ?")
    .get(url);
  return !!row;
}

export function markUrlSeen(url: string, title: string, sourceId: string): void {
  const db = getDb();
  db.prepare(
    `INSERT OR IGNORE INTO seen_urls (url, title, source_id) VALUES (?, ?, ?)`
  ).run(url, title, sourceId);
}

export function markUrlsBatch(
  items: Array<{ url: string; title: string; sourceId: string }>
): void {
  const db = getDb();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO seen_urls (url, title, source_id) VALUES (?, ?, ?)`
  );
  const transaction = db.transaction(() => {
    for (const item of items) {
      insert.run(item.url, item.title, item.sourceId);
    }
  });
  transaction();
}
