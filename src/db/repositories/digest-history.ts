import { getDb } from "../database.js";

interface DigestRecord {
  itemCount: number;
  sectionsJson: string;
  recipients: string;
  status: string;
}

export function saveDigestHistory(record: DigestRecord): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO digest_history (item_count, sections_json, recipients, status)
       VALUES (?, ?, ?, ?)`
    )
    .run(record.itemCount, record.sectionsJson, record.recipients, record.status);
  return result.lastInsertRowid as number;
}

export function getLastDigestDate(): string | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT sent_at FROM digest_history WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 1"
    )
    .get() as { sent_at: string } | undefined;
  return row?.sent_at ?? null;
}
