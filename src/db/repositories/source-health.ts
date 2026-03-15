import { getDb } from "../database.js";

export function recordSuccess(sourceId: string, itemCount: number): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO source_health (source_id, last_success_at, consecutive_failures, total_items_collected)
     VALUES (?, datetime('now'), 0, ?)
     ON CONFLICT(source_id) DO UPDATE SET
       last_success_at = datetime('now'),
       consecutive_failures = 0,
       total_items_collected = total_items_collected + ?`
  ).run(sourceId, itemCount, itemCount);
}

export function recordFailure(sourceId: string): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO source_health (source_id, last_failure_at, consecutive_failures)
     VALUES (?, datetime('now'), 1)
     ON CONFLICT(source_id) DO UPDATE SET
       last_failure_at = datetime('now'),
       consecutive_failures = consecutive_failures + 1`
  ).run(sourceId);
}

export function getUnhealthySources(): Array<{
  source_id: string;
  consecutive_failures: number;
}> {
  const db = getDb();
  return db
    .prepare(
      "SELECT source_id, consecutive_failures FROM source_health WHERE consecutive_failures >= 3"
    )
    .all() as Array<{ source_id: string; consecutive_failures: number }>;
}
