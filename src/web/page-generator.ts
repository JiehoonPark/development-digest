import { writeFileSync, mkdirSync, readFileSync, readdirSync, existsSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ArchiveData } from "../data/digest-archiver.js";
import { renderIndexPage } from "./templates/index-page.js";
import { renderDailyDigestPage } from "./templates/daily-digest-page.js";
import { renderArticleDetailPage } from "./templates/article-detail-page.js";
import { renderSearchPage } from "./templates/search-page.js";
import { buildSearchIndex } from "./search-index-builder.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("page-generator");
const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_DIR = join(__dirname, "../../site");
const ARCHIVES_DIR = join(__dirname, "../../data/archives");

export function generateSite(newArchive?: ArchiveData): void {
  const baseUrl = process.env.SITE_BASE_URL ?? "/";

  // 1. site/ 디렉토리 생성
  mkdirSync(SITE_DIR, { recursive: true });

  // 2. 정적 파일 복사
  copyStaticFiles();

  // 3. 모든 아카이브 로드 (기존 + 신규)
  const archives = loadAllArchives(newArchive);

  if (archives.length === 0) {
    log.warn("아카이브 없음 — 빈 사이트 생성");
  }

  // 4. 아카이브 JSON을 site/data/archives/에도 복사 (gh-pages 영속용)
  const siteArchivesDir = join(SITE_DIR, "data/archives");
  mkdirSync(siteArchivesDir, { recursive: true });
  for (const archive of archives) {
    writeFileSync(
      join(siteArchivesDir, `${archive.date}.json`),
      JSON.stringify(archive, null, 2)
    );
  }

  // 5. 인덱스 페이지
  writeFileSync(join(SITE_DIR, "index.html"), renderIndexPage(archives, baseUrl));

  // 6. 검색 페이지 + 인덱스
  writeFileSync(join(SITE_DIR, "search.html"), renderSearchPage(baseUrl));
  const searchIndex = buildSearchIndex(archives, baseUrl);
  writeFileSync(join(SITE_DIR, "search-index.json"), JSON.stringify(searchIndex));

  // 7. 일별 다이제스트 + 아티클 상세 페이지
  let totalPages = 0;
  for (const archive of archives) {
    const [year, month, day] = archive.date.split("-");
    const dayDir = join(SITE_DIR, year, month, day);
    mkdirSync(dayDir, { recursive: true });

    writeFileSync(join(dayDir, "index.html"), renderDailyDigestPage(archive, baseUrl));
    totalPages++;

    for (const section of archive.sections) {
      for (const item of section.items) {
        if (item.fullContent || item.translatedContent) {
          writeFileSync(
            join(dayDir, `${item.slug}.html`),
            renderArticleDetailPage(item, archive.date, baseUrl)
          );
          totalPages++;
        }
      }
    }
  }

  log.info(
    { totalPages, archives: archives.length, siteDir: SITE_DIR },
    "사이트 생성 완료"
  );
}

function copyStaticFiles(): void {
  const staticDir = join(__dirname, "static");
  const files = ["style.css", "search.js"];

  for (const file of files) {
    const src = join(staticDir, file);
    if (existsSync(src)) {
      copyFileSync(src, join(SITE_DIR, file));
    }
  }
}

function loadAllArchives(newArchive?: ArchiveData): ArchiveData[] {
  const archives = new Map<string, ArchiveData>();

  // data/archives/에서 로드
  if (existsSync(ARCHIVES_DIR)) {
    for (const file of readdirSync(ARCHIVES_DIR)) {
      if (!file.endsWith(".json")) continue;
      try {
        const data = JSON.parse(readFileSync(join(ARCHIVES_DIR, file), "utf-8")) as ArchiveData;
        archives.set(data.date, data);
      } catch {
        log.warn({ file }, "아카이브 파싱 실패");
      }
    }
  }

  // site/data/archives/에서도 로드 (gh-pages 복원분)
  const siteArchivesDir = join(SITE_DIR, "data/archives");
  if (existsSync(siteArchivesDir)) {
    for (const file of readdirSync(siteArchivesDir)) {
      if (!file.endsWith(".json")) continue;
      const date = file.replace(".json", "");
      if (archives.has(date)) continue;
      try {
        const data = JSON.parse(readFileSync(join(siteArchivesDir, file), "utf-8")) as ArchiveData;
        archives.set(data.date, data);
      } catch {
        log.warn({ file }, "사이트 아카이브 파싱 실패");
      }
    }
  }

  // 신규 아카이브 병합
  if (newArchive) {
    archives.set(newArchive.date, newArchive);
  }

  return Array.from(archives.values());
}
