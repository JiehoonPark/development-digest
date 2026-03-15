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

const CATEGORY_TECH_MAP: Record<string, string> = {
  hot: "frontend",
  tech: "frontend",
  insight: "general",
  video: "frontend",
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
      const fileName = sanitizeFileName(item.titleKo ?? item.title);
      writeFileSync(join(dayDir, `${fileName}.md`), articleContent);
      count++;
    }
  }

  log.info({ date: archive.date, articles: count, outputDir: dayDir }, "Markdown 생성 완료");
}

function buildDailyIndex(archive: ArchiveData): string {
  const totalItems = archive.sections.reduce((acc, s) => acc + s.items.length, 0);

  let md = `---
title: "Dev Digest — ${archive.date}"
tags: [dev-digest, frontend]
type: reference
created: ${archive.date}
updated: ${archive.date}
aliases: []
---

> [!abstract]
> ${archive.intro}

`;

  for (const section of archive.sections) {
    const header = SECTION_LABELS[section.category] ?? { emoji: "📄", title: section.category };
    md += `## ${header.emoji} ${header.title}\n\n`;

    for (const item of section.items) {
      const displayTitle = item.titleKo ?? item.title;
      const fileName = sanitizeFileName(displayTitle);
      const wikiLink = `[[${archive.date}/${fileName}|${displayTitle}]]`;
      md += `- ${wikiLink} — ${item.summary.slice(0, 80)}${item.summary.length > 80 ? "..." : ""}\n`;
    }

    md += "\n";
  }

  md += `---\n\n> ${totalItems}개 아티클 · [[MOC - 개발 학습|학습 노트 허브]]\n`;

  return md;
}

function buildArticleMd(item: ArchiveItem, date: string): string {
  const displayTitle = item.titleKo ?? item.title;
  const techTags = extractTechTags(item);
  const tags = ["dev-digest", item.category, ...techTags].filter(Boolean);

  let md = `---
title: "${escapeYaml(displayTitle)}"
tags: [${tags.join(", ")}]
type: study
tech:
${techTags.length > 0 ? techTags.map((t) => `  - ${t}`).join("\n") : "  - frontend"}
level: ""
created: ${date}
aliases: []
---

`;

  // 원문 제목 (한국어 번역과 다른 경우)
  if (item.titleKo && item.titleKo !== item.title) {
    md += `> [!info] 원문\n> [${item.title}](${item.url}) · ${item.sourceName}\n\n`;
  }

  // 요약
  md += `## 핵심 개념\n\n`;
  md += `> [!abstract]\n> ${item.summary}\n\n`;

  // 핵심 포인트
  if (item.keyPoints?.length) {
    md += `## 상세 내용\n\n`;
    for (const kp of item.keyPoints) {
      md += `- ${kp}\n`;
    }
    md += "\n";
  }

  // 왜 중요한가
  if (item.whyItMatters) {
    md += `> [!tip] 왜 중요한가\n> ${item.whyItMatters}\n\n`;
  }

  // 전문 번역
  if (item.translatedContent) {
    md += `## 전문 번역\n\n${item.translatedContent}\n\n`;
  }

  // 참고 자료
  md += `## 참고 자료\n\n`;
  md += `- [원문 링크](${item.url})\n`;
  md += `- via ${item.sourceName}\n`;
  if (item.engagement) {
    md += `- engagement: ${item.engagement}\n`;
  }
  md += "\n";

  // 관련 노트
  md += `## 관련 노트\n\n`;
  md += `- [[${date}|${date} Dev Digest]]\n`;

  return md;
}

function extractTechTags(item: ArchiveItem): string[] {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const techMap: Record<string, string> = {
    react: "react",
    "next.js": "nextjs",
    nextjs: "nextjs",
    typescript: "typescript",
    javascript: "javascript",
    css: "css",
    tailwind: "tailwind",
    vue: "vue",
    svelte: "svelte",
    astro: "astro",
    node: "nodejs",
    vite: "vite",
    webpack: "webpack",
  };

  const found = new Set<string>();
  for (const [keyword, tag] of Object.entries(techMap)) {
    if (text.includes(keyword)) found.add(tag);
  }

  return Array.from(found);
}

function sanitizeFileName(title: string): string {
  return title
    .replace(/[/\\:*?"<>|#^\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function escapeYaml(text: string): string {
  return text.replace(/"/g, '\\"');
}
