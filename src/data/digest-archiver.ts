import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { DigestResult, DigestItem } from "../summarizer/batch-processor.js";
import type { ScoredItem } from "../prioritizer/scoring.js";
import { formatISODate } from "../utils/date.js";
import { uniqueSlug } from "../web/slug.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("digest-archiver");
const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ArchiveItem extends DigestItem {
  slug: string;
  fullContent?: string;
  translatedContent?: string;
  category: string;
  publishedAt?: string;
  language?: string;
  tags?: string[];
}

export interface ArchiveData {
  date: string;
  intro: string;
  sections: Array<{
    category: string;
    items: ArchiveItem[];
  }>;
}

export function buildArchiveData(
  digest: DigestResult,
  enrichedItems: ScoredItem[],
  date: Date = new Date()
): ArchiveData {
  const enrichedByUrl = new Map<string, ScoredItem>();
  for (const item of enrichedItems) {
    enrichedByUrl.set(item.url, item);
  }

  const slugSet = new Set<string>();

  const sections = digest.sections.map((section) => ({
    category: section.category,
    items: section.items.map((item): ArchiveItem => {
      const enriched = enrichedByUrl.get(item.url);
      return {
        ...item,
        slug: uniqueSlug(item.title, slugSet),
        fullContent: enriched?.fullContent,
        category: section.category,
        publishedAt: enriched?.publishedAt,
        language: enriched?.language,
        tags: enriched?.tags,
      };
    }),
  }));

  return {
    date: formatISODate(date),
    intro: digest.intro,
    sections,
  };
}

export function saveArchive(archive: ArchiveData): string {
  const archiveDir = join(__dirname, "../../data/archives");
  mkdirSync(archiveDir, { recursive: true });

  const filePath = join(archiveDir, `${archive.date}.json`);
  writeFileSync(filePath, JSON.stringify(archive, null, 2));

  log.info({ path: filePath, date: archive.date }, "아카이브 저장 완료");
  return filePath;
}
