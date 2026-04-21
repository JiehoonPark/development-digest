/**
 * 빌드 전에 `public/search-index.json` 을 생성.
 * 데이터는 `../data/archives/*.json`, URL은 trailing-slash 스타일 (Next export용).
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

import { buildSearchIndex } from "../../src/web/search-index-builder.js";
import type { ArchiveData } from "../../src/data/digest-archiver.js";

const ARCHIVE_DIR = resolve(process.cwd(), "..", "data", "archives");
const PUBLIC_DIR = resolve(process.cwd(), "public");
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "/development-digest/";

function loadAll(): ArchiveData[] {
  if (!existsSync(ARCHIVE_DIR)) return [];
  return readdirSync(ARCHIVE_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(ARCHIVE_DIR, f), "utf8")) as ArchiveData);
}

function main() {
  const archives = loadAll();
  const index = buildSearchIndex(archives, BASE_URL, { urlStyle: "trailing-slash" });

  mkdirSync(PUBLIC_DIR, { recursive: true });
  const outPath = join(PUBLIC_DIR, "search-index.json");
  writeFileSync(outPath, JSON.stringify(index));

  // eslint-disable-next-line no-console
  console.log(`[build-search-index] ${index.items.length}개 아이템 → ${outPath}`);
}

main();
