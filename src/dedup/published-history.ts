import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { subDays } from "date-fns";
import { normalizeTitleKey } from "../db/repositories/recent-titles.js";
import { formatISODate } from "../utils/date.js";
import { createChildLogger } from "../utils/logger.js";
import { normalizeUrl } from "./normalize-url.js";

const log = createChildLogger("published-history");

/**
 * 이전 발행본에 실린 기사를 다시 싣지 않는 기간.
 * SQLite 의 seen_urls(30일)와 같게 맞춘다. DB 캐시가 유실돼도 이 기간은 아카이브로 막는다.
 */
export const PUBLISHED_LOOKBACK_DAYS = 30;

const ARCHIVE_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})\.json$/;

export interface PublishedHistory {
  urls: Set<string>;
  titleKeys: Set<string>;
  archiveCount: number;
}

interface ArchivedItem {
  url?: unknown;
  title?: unknown;
  titleKo?: unknown;
}

export function emptyPublishedHistory(): PublishedHistory {
  return { urls: new Set(), titleKeys: new Set(), archiveCount: 0 };
}

/**
 * data/archives/YYYY-MM-DD.json 중 lookback 기간 안의 "오늘 이전" 발행본에서
 * URL·제목 키를 모은다. 오늘 날짜 파일은 같은 날 재실행 시 자기 자신을 지우지 않도록 제외한다.
 * 손상된 파일은 건너뛰고 경고만 남긴다 (중복 방지 보조 장치가 발송 전체를 막지 않게).
 */
export function loadPublishedHistory(
  archiveDir: string,
  now: Date = new Date(),
  lookbackDays: number = PUBLISHED_LOOKBACK_DAYS
): PublishedHistory {
  const history = emptyPublishedHistory();
  if (!existsSync(archiveDir)) return history;

  const today = formatISODate(now);
  const oldestDate = formatISODate(subDays(now, lookbackDays));

  for (const fileName of readdirSync(archiveDir)) {
    const archiveDate = ARCHIVE_FILE_PATTERN.exec(fileName)?.[1];
    if (!archiveDate) continue;

    const isInLookback = archiveDate >= oldestDate && archiveDate < today;
    if (!isInLookback) continue;

    try {
      const archive = JSON.parse(readFileSync(join(archiveDir, fileName), "utf-8"));
      for (const item of collectArchivedItems(archive)) addItem(history, item);
      history.archiveCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.warn({ fileName, error: message }, "아카이브를 읽지 못해 중복 이력에서 제외");
    }
  }

  return history;
}

function collectArchivedItems(archive: unknown): ArchivedItem[] {
  const sections = (archive as { sections?: unknown })?.sections;
  if (!Array.isArray(sections)) return [];
  return sections.flatMap((section) => {
    const items = (section as { items?: unknown })?.items;
    return Array.isArray(items) ? (items as ArchivedItem[]) : [];
  });
}

function addItem(history: PublishedHistory, item: ArchivedItem): void {
  if (typeof item.url === "string" && item.url) {
    history.urls.add(normalizeUrl(item.url));
  }
  for (const title of [item.title, item.titleKo]) {
    if (typeof title !== "string") continue;
    const key = normalizeTitleKey(title);
    if (key) history.titleKeys.add(key);
  }
}
