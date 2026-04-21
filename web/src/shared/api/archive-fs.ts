/**
 * 빌드타임 전용. Next.js Server Components에서만 호출할 것.
 * `web/` cwd 기준 `../data/archives/` 아래의 JSON을 읽어 돌려준다.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

import type { ArchiveData } from "@/shared/config";

const ARCHIVE_DIR = resolve(process.cwd(), "..", "data", "archives");

export function loadAllArchives(): ArchiveData[] {
  if (!existsSync(ARCHIVE_DIR)) return [];

  const files = readdirSync(ARCHIVE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const archives: ArchiveData[] = [];
  for (const file of files) {
    try {
      const raw = readFileSync(join(ARCHIVE_DIR, file), "utf8");
      archives.push(JSON.parse(raw) as ArchiveData);
    } catch {
      // 손상된 JSON은 조용히 건너뜀 — 빌드를 막지 않는다
    }
  }

  return archives;
}

export function loadArchiveByDate(date: string): ArchiveData | null {
  const file = join(ARCHIVE_DIR, `${date}.json`);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as ArchiveData;
  } catch {
    return null;
  }
}

export function loadLatestArchive(): ArchiveData | null {
  const all = loadAllArchives();
  if (all.length === 0) return null;
  return all.sort((a, b) => b.date.localeCompare(a.date))[0];
}
