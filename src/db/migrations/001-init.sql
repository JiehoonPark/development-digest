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

-- 같은 스토리가 다른 URL 로 재업로드되는 것을 차단.
-- URL 기반 dedup 은 React Blog + HN + Reddit 처럼 여러 출처에 올라온 같은 스토리를 놓친다.
-- 최근 3일 이내 다룬 정규화 제목(title_hash)을 저장해 cross-day 중복을 잡는다.
CREATE TABLE IF NOT EXISTS recent_story_titles (
  title_hash TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL DEFAULT (datetime('now', '+3 days'))
);

CREATE INDEX IF NOT EXISTS idx_recent_titles_expires ON recent_story_titles(expires_at);
