import type { ScoredItem } from "../prioritizer/scoring.js";
import { askClaude, parseJsonResponse } from "./claude-summarizer.js";
import { buildFilterInput, buildSummarizeInput, buildEditorialInput } from "./prompt-builder.js";
import { FILTER_PROMPT, SUMMARIZE_PROMPT, EDITORIAL_PROMPT } from "../../config/prompts.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("batch-processor");

export interface DigestSection {
  category: "hot" | "tech" | "insight" | "video";
  items: DigestItem[];
}

export interface DigestItem {
  title: string;
  url: string;
  sourceName: string;
  summary: string;
  engagement?: number;
  contentType: string;
}

export interface DigestResult {
  intro: string;
  sections: DigestSection[];
}

export async function processWithAI(items: ScoredItem[]): Promise<DigestResult> {
  // Step 1: 필터 + 분류
  log.info("Step 1: 필터링 및 분류");
  const filterInput = buildFilterInput(items);
  const filterRaw = await askClaude(FILTER_PROMPT, filterInput);
  const filtered = parseJsonResponse<Array<{ index: number; category: string; relevance: number }>>(filterRaw);

  const relevantItems = filtered
    .filter((f) => f.relevance >= 60)
    .map((f) => ({
      ...items[f.index],
      aiCategory: f.category as DigestSection["category"],
    }));

  log.info({ filtered: relevantItems.length }, "필터링 완료");

  // Step 2: 요약
  log.info("Step 2: 요약 생성");
  const summarizeInput = buildSummarizeInput(
    relevantItems.map((item, i) => ({
      index: i,
      title: item.title,
      url: item.url,
      summary: item.summary,
    }))
  );
  const summarizeRaw = await askClaude(SUMMARIZE_PROMPT, summarizeInput);
  const summaries = parseJsonResponse<Array<{ index: number; summary: string }>>(summarizeRaw);

  const summaryMap = new Map(summaries.map((s) => [s.index, s.summary]));

  // 섹션별 그룹화
  const sections: Record<string, Array<{ index: number; title: string; summary: string; url: string; sourceName: string; engagement?: number; contentType: string }>> = {
    hot: [],
    tech: [],
    insight: [],
    video: [],
  };

  for (let i = 0; i < relevantItems.length; i++) {
    const item = relevantItems[i];
    const summary = summaryMap.get(i) ?? item.summary ?? "";
    const cat = item.aiCategory;
    if (sections[cat]) {
      sections[cat].push({
        index: i,
        title: item.title,
        summary,
        url: item.url,
        sourceName: item.sourceName,
        engagement: item.engagement,
        contentType: item.contentType,
      });
    }
  }

  // Step 3: 편집 (도입부 + 순서)
  log.info("Step 3: 편집");
  const editInput = buildEditorialInput(
    Object.fromEntries(
      Object.entries(sections).map(([key, items]) => [
        key,
        items.map((item) => ({ index: item.index, title: item.title, summary: item.summary })),
      ])
    )
  );
  const editRaw = await askClaude(EDITORIAL_PROMPT, editInput);
  const editorial = parseJsonResponse<{
    intro: string;
    sectionOrder: Record<string, number[]>;
  }>(editRaw);

  // 최종 섹션 구성
  const finalSections: DigestSection[] = [];

  for (const [cat, label] of [
    ["hot", "hot"],
    ["tech", "tech"],
    ["insight", "insight"],
    ["video", "video"],
  ] as const) {
    const sectionItems = sections[cat];
    if (sectionItems.length === 0) continue;

    const order = editorial.sectionOrder?.[cat] ?? sectionItems.map((_, i) => i);
    const ordered = order
      .filter((idx) => idx < sectionItems.length)
      .map((idx) => sectionItems[idx])
      .filter(Boolean);

    finalSections.push({
      category: cat,
      items: ordered.map((item) => ({
        title: item.title,
        url: item.url,
        sourceName: item.sourceName,
        summary: item.summary,
        engagement: item.engagement,
        contentType: item.contentType,
      })),
    });
  }

  log.info(
    { sections: finalSections.map((s) => `${s.category}:${s.items.length}`) },
    "AI 처리 완료"
  );

  return {
    intro: editorial.intro,
    sections: finalSections,
  };
}
