import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("database");
const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

export function getDbPath(): string {
  const dataDir = join(__dirname, "../../data");
  mkdirSync(dataDir, { recursive: true });
  return join(dataDir, "dev-digest.db");
}

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = getDbPath();
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    log.info({ path: dbPath }, "DB 연결");
  }
  return db;
}

export function initDb(): void {
  const database = getDb();
  const migrationPath = join(__dirname, "migrations/001-init.sql");
  const sql = readFileSync(migrationPath, "utf-8");
  database.exec(sql);
  log.info("DB 마이그레이션 완료");
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    log.info("DB 연결 종료");
  }
}

export function cleanExpiredUrls(): void {
  const database = getDb();
  const result = database
    .prepare("DELETE FROM seen_urls WHERE expires_at < datetime('now')")
    .run();
  if (result.changes > 0) {
    log.info({ deleted: result.changes }, "만료 URL 정리");
  }
}
