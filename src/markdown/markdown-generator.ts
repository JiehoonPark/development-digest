import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ArchiveData, ArchiveItem } from "../data/digest-archiver.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("markdown-generator");
const __dirname = dirname(fileURLToPath(import.meta.url));

const SECTION_LABELS: Record<string, { emoji: string; title: string }> = {
  hot: { emoji: "📌", title: "오늘의 화제" },
  tech: { emoji: "🛠", title: "프론트엔드 기술" },
  insight: { emoji: "💡", title: "알면 좋은 정보" },
  video: { emoji: "🎬", title: "새 영상 알림" },
};

export function generateMarkdown(archive: ArchiveData): void {
  const outputBase = process.env.OBSIDIAN_OUTPUT_DIR
    ?? join(__dirname, "../../data/markdown");

  const dayDir = join(outputBase, archive.date);
  mkdirSync(dayDir, { recursive: true });

  // 1. 일별 인덱스
  const indexContent = buildDailyIndex(archive);
  writeFileSync(join(outputBase, `${archive.date}.md`), indexContent);

  // 2. 개별 아티클
  let count = 0;
  for (const section of archive.sections) {
    for (const item of section.items) {
      const articleContent = buildArticleMd(item, archive.date);
      const fileName = sanitizeFileName(item.title);
      writeFileSync(join(dayDir, `${fileName}.md`), articleContent);
      count++;
    }
  }

  log.info({ date: archive.date, articles: count, outputDir: dayDir }, "Markdown 생성 완료");
}

function buildDailyIndex(archive: ArchiveData): string {
  const totalItems = archive.sections.reduce((acc, s) => acc + s.items.length, 0);
  const tags = ["dev-digest", "frontend"];

  let md = `---
date: ${archive.date}
tags: [${tags.join(", ")}]
total_articles: ${totalItems}
---
# Dev Digest — ${archive.date}

> ${archive.intro}

`;

  for (const section of archive.sections) {
    const header = SECTION_LABELS[section.category] ?? { emoji: "📄", title: section.category };
    md += `## ${header.emoji} ${header.title}\n`;

    for (const item of section.items) {
      const wikiLink = `[[${archive.date}/${sanitizeFileName(item.title)}|${item.title}]]`;
      md += `- ${wikiLink} — ${item.summary.slice(0, 80)}${item.summary.length > 80 ? "..." : ""}\n`;
    }

    md += "\n";
  }

  return md;
}

function buildArticleMd(item: ArchiveItem, date: string): string {
  const tags = [
    item.category,
    ...(item.tags ?? []),
  ].filter(Boolean);

  let md = `---
date: ${date}
source: ${item.sourceName}
category: ${item.category}
url: ${item.url}
tags: [${tags.join(", ")}]
---
# ${item.title}

## 요약
${item.summary}

`;

  if (item.keyPoints?.length) {
    md += `## 핵심 포인트\n`;
    for (const kp of item.keyPoints) {
      md += `- ${kp}\n`;
    }
    md += "\n";
  }

  if (item.whyItMatters) {
    md += `## 왜 중요한가\n${item.whyItMatters}\n\n`;
  }

  if (item.translatedContent) {
    md += `## 전문 번역\n${item.translatedContent}\n\n`;
  }

  md += `---\n> 원문: [${item.title}](${item.url})\n`;

  return md;
}

function sanitizeFileName(title: string): string {
  return title
    .replace(/[/\\:*?"<>|#^\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}
