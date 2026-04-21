/**
 * 빌드 전에 `public/search-index.json` 을 생성.
 * `../data/archives/*.json` 을 읽어 Cmd+K 팔레트가 소비하는 평평한 인덱스로 변환.
 *
 * 파이프라인(src/) 코드를 import 하지 않는다 — web/ 는 독립 빌드 단위라서
 * 루트 런타임 의존성(@anthropic-ai/sdk 등)을 끌고오지 않아야 CI 에서 `npm ci`
 * 한 번으로 빌드가 끝난다.
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ARCHIVE_DIR = resolve(process.cwd(), "..", "data", "archives");
const PUBLIC_DIR = resolve(process.cwd(), "public");

interface ArchiveItem {
  title: string;
  slug: string;
  summary: string;
  keyPoints?: string[];
  sourceName: string;
  url: string;
  category: string;
}

interface ArchiveSection {
  category: string;
  items: ArchiveItem[];
}

interface ArchiveData {
  date: string;
  sections: ArchiveSection[];
}

interface SearchIndexItem {
  title: string;
  summary: string;
  keyPoints: string[];
  sourceName: string;
  category: string;
  date: string;
  url: string;
  detailUrl: string;
}

function loadAll(): ArchiveData[] {
  if (!existsSync(ARCHIVE_DIR)) return [];
  return readdirSync(ARCHIVE_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(ARCHIVE_DIR, f), "utf8")) as ArchiveData);
}

function buildIndex(archives: ArchiveData[]): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];

  for (const archive of archives) {
    const [year, month, day] = archive.date.split("-");
    for (const section of archive.sections) {
      for (const item of section.items) {
        items.push({
          title: item.title,
          summary: item.summary,
          keyPoints: item.keyPoints ?? [],
          sourceName: item.sourceName,
          category: section.category,
          date: archive.date,
          url: item.url,
          // basePath 없는 내부 경로 — CmdK의 router.push 가 자동으로 basePath prepend
          detailUrl: `/${year}/${month}/${day}/${item.slug}/`,
        });
      }
    }
  }
  return items;
}

function main() {
  const archives = loadAll();
  const items = buildIndex(archives);

  mkdirSync(PUBLIC_DIR, { recursive: true });
  const outPath = join(PUBLIC_DIR, "search-index.json");
  writeFileSync(outPath, JSON.stringify({ items }));

  // eslint-disable-next-line no-console
  console.log(`[build-search-index] ${items.length}개 아이템 → ${outPath}`);
}

main();
