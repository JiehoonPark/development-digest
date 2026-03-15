import type { ScoredItem } from "../prioritizer/scoring.js";
import { askClaude, parseJsonResponse } from "./claude-summarizer.js";
import { buildFilterInput, buildSummarizeInput, buildEditorialInput } from "./prompt-builder.js";
import { FILTER_PROMPT, SUMMARIZE_PROMPT, EDITORIAL_PROMPT } from "../../config/prompts.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("batch-processor");

const SUMMARIZE_BATCH_SIZE = 8;

export interface DigestSection {
  category: "hot" | "tech" | "insight" | "video";
  items: DigestItem[];
}

export interface DigestItem {
  title: string;
  titleKo?: string;
  url: string;
  sourceName: string;
  summary: string;
  keyPoints: string[];
  whyItMatters?: string;
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

  const MIN_ITEMS = 10;
  const sorted = [...filtered].sort((a, b) => b.relevance - a.relevance);
  const cutoff = sorted.length >= MIN_ITEMS
    ? Math.min(60, sorted[MIN_ITEMS - 1]?.relevance ?? 0)
    : 0;

  const relevantItems = sorted
    .filter((f) => f.relevance >= cutoff)
    .map((f) => ({
      ...items[f.index],
      aiCategory: f.category as DigestSection["category"],
    }));

  log.info({ filtered: relevantItems.length, cutoff }, "필터링 완료");

  // Step 2: 요약 (배치 분할 — 본문 포함 시 토큰이 크므로)
  log.info("Step 2: 요약 생성");

  const allSummaries: Array<{
    index: number;
    titleKo?: string;
    summary: string;
    keyPoints?: string[];
    whyItMatters?: string;
  }> = [];

  for (let batchStart = 0; batchStart < relevantItems.length; batchStart += SUMMARIZE_BATCH_SIZE) {
    const batch = relevantItems.slice(batchStart, batchStart + SUMMARIZE_BATCH_SIZE);
    const batchInput = buildSummarizeInput(
      batch.map((item, localIdx) => ({
        index: batchStart + localIdx,
        title: item.title,
        url: item.url,
        summary: item.summary,
        fullContent: item.fullContent,
        contentType: item.contentType,
      }))
    );

    log.info(
      { batch: `${batchStart + 1}-${batchStart + batch.length}`, inputLength: batchInput.length },
      "배치 요약 요청"
    );

    const raw = await askClaude(SUMMARIZE_PROMPT, batchInput, undefined, 8192);
    const parsed = parseJsonResponse<Array<{
      index: number;
      titleKo?: string;
      summary: string;
      keyPoints?: string[];
      whyItMatters?: string;
    }>>(raw);

    allSummaries.push(...parsed);
  }

  const summaryMap = new Map(
    allSummaries.map((s) => [s.index, s])
  );

  // 섹션별 그룹화
  const sections: Record<string, Array<{
    index: number;
    title: string;
    titleKo?: string;
    summary: string;
    keyPoints: string[];
    whyItMatters?: string;
    url: string;
    sourceName: string;
    engagement?: number;
    contentType: string;
  }>> = {
    hot: [],
    tech: [],
    insight: [],
    video: [],
  };

  for (let i = 0; i < relevantItems.length; i++) {
    const item = relevantItems[i];
    const summaryEntry = summaryMap.get(i);
    const summary = summaryEntry?.summary ?? item.summary ?? "";
    const keyPoints = summaryEntry?.keyPoints ?? [];
    const whyItMatters = summaryEntry?.whyItMatters;
    const titleKo = summaryEntry?.titleKo;
    const cat = item.aiCategory;
    if (sections[cat]) {
      sections[cat].push({
        index: i,
        title: item.title,
        titleKo,
        summary,
        keyPoints,
        whyItMatters,
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

  for (const [cat] of [
    ["hot"],
    ["tech"],
    ["insight"],
    ["video"],
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
        titleKo: item.titleKo,
        url: item.url,
        sourceName: item.sourceName,
        summary: item.summary,
        keyPoints: item.keyPoints,
        whyItMatters: item.whyItMatters,
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
