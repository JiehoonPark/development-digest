CREATE TABLE IF NOT EXISTS seen_urls (
  url TEXT PRIMARY KEY,
  title TEXT,
  source_id TEXT NOT NULL,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL DEFAULT (datetime('now', '+30 days'))
);

CREATE INDEX IF NOT EXISTS idx_seen_urls_expires ON seen_urls(expires_at);

CREATE TABLE IF NOT EXISTS digest_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  item_count INTEGER NOT NULL,
  sections_json TEXT,
  recipients TEXT,
  status TEXT NOT NULL DEFAULT 'sent'
);

CREATE TABLE IF NOT EXISTS source_health (
  source_id TEXT PRIMARY KEY,
  last_success_at TEXT,
  last_failure_at TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  total_items_collected INTEGER NOT NULL DEFAULT 0
);
