import type { ScoredItem } from "../prioritizer/scoring.js";
import { askClaude, parseJsonResponse } from "./claude-summarizer.js";
import { buildFilterInput, buildSummarizeInput, buildEditorialInput } from "./prompt-builder.js";
import { FILTER_PROMPT, SUMMARIZE_PROMPT, SUMMARIZE_BRIEF_PROMPT, EDITORIAL_PROMPT } from "../../config/prompts.js";
import { getRecentTitles } from "../db/repositories/recent-titles.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("batch-processor");

const SUMMARIZE_BATCH_SIZE = 8;
const DEEP_RELEVANCE_THRESHOLD = 80;

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
  labels?: string[];
  topicId?: string;
  isTopicPrimary?: boolean;
  relatedCount?: number;
}

export interface DigestResult {
  intro: string;
  sections: DigestSection[];
}

interface ClassifiedItem extends ScoredItem {
  aiCategory: DigestSection["category"];
  labels: string[];
  relevance: number;
  topicId?: string;
  isTopicPrimary?: boolean;
}

export async function processWithAI(items: ScoredItem[]): Promise<DigestResult> {
  // Step 1: 분류 + 라벨 + 토픽 클러스터링
  // 최근 3일 이내 다룬 제목을 Claude 에 함께 전달해 cross-day 중복 주제를 디모트
  const recentTitles = getRecentTitles(60);
  log.info(
    { itemCount: items.length, recentTitleCount: recentTitles.length },
    "Step 1: 분류, 라벨 부여, 토픽 클러스터링"
  );
  const filterInput = buildFilterInput(items, recentTitles);
  const filterRaw = await askClaude(FILTER_PROMPT, filterInput);
  const classified = parseJsonResponse<Array<{
    index: number;
    category: string;
    labels?: string[];
    relevance: number;
    topicId?: string | null;
    isTopicPrimary?: boolean;
  }>>(filterRaw);

  const classifyMap = new Map(classified.map((c) => [c.index, c]));

  // 토픽별 카운트 계산
  const topicCounts = new Map<string, number>();
  for (const c of classified) {
    if (c.topicId) {
      topicCounts.set(c.topicId, (topicCounts.get(c.topicId) ?? 0) + 1);
    }
  }

  const relevantItems: ClassifiedItem[] = items
    .map((item, i) => {
      const cls = classifyMap.get(i);
      return {
        ...item,
        aiCategory: (cls?.category ?? "insight") as DigestSection["category"],
        labels: cls?.labels ?? ["general"],
        relevance: cls?.relevance ?? 50,
        topicId: cls?.topicId ?? undefined,
        isTopicPrimary: cls?.isTopicPrimary ?? true,
      };
    })
    .sort((a, b) => b.relevance - a.relevance);

  log.info({ total: relevantItems.length }, "분류 완료");

  // Step 2: 요약 (relevance 기반 깊이 차등)
  log.info("Step 2: 요약 생성 (심층/간략 차등)");

  // 영상은 자막(fullContent)이 있으면 relevance 와 무관하게 심층 티어로.
  // YouTube 는 engagement 메트릭이 없어 스코어가 낮게 나오지만, 자막만 확보되면
  // 요약 품질이 크게 향상됨.
  const isDeepTier = (item: ClassifiedItem) => {
    if (item.relevance >= DEEP_RELEVANCE_THRESHOLD) return true;
    if (item.contentType === "video" && (item.fullContent?.length ?? 0) > 500) return true;
    return false;
  };

  const deepItems = relevantItems.filter(isDeepTier);
  const briefItems = relevantItems.filter((item) => !isDeepTier(item));

  log.info(
    {
      deep: deepItems.length,
      brief: briefItems.length,
      videoInDeep: deepItems.filter((i) => i.contentType === "video").length,
    },
    "요약 티어 분리"
  );

  const allSummaries = [
    ...(await summarizeTier(relevantItems, deepItems, SUMMARIZE_PROMPT, 16384, "심층")),
    ...(await summarizeTier(relevantItems, briefItems, SUMMARIZE_BRIEF_PROMPT, 8192, "간략")),
  ];

  const summaryMap = new Map(allSummaries.map((s) => [s.index, s]));

  // 섹션별 그룹화
  const sections: Record<string, DigestItem[]> = {
    hot: [],
    tech: [],
    insight: [],
    video: [],
  };

  for (let i = 0; i < relevantItems.length; i++) {
    const item = relevantItems[i];
    const summaryEntry = summaryMap.get(i);
    const cat = item.aiCategory;
    const relatedCount = item.topicId ? (topicCounts.get(item.topicId) ?? 1) - 1 : 0;

    if (sections[cat]) {
      sections[cat].push({
        title: item.title,
        titleKo: summaryEntry?.titleKo,
        summary: summaryEntry?.summary ?? item.summary ?? "",
        keyPoints: summaryEntry?.keyPoints ?? [],
        whyItMatters: summaryEntry?.whyItMatters,
        url: item.url,
        sourceName: item.sourceName,
        engagement: item.engagement,
        contentType: item.contentType,
        labels: item.labels,
        topicId: item.topicId,
        isTopicPrimary: item.isTopicPrimary,
        relatedCount: relatedCount > 0 ? relatedCount : undefined,
      });
    }
  }

  // Step 3: 편집 (도입부 + 순서)
  log.info("Step 3: 편집");
  const editInput = buildEditorialInput(
    Object.fromEntries(
      Object.entries(sections).map(([key, items]) => [
        key,
        items.map((item, idx) => ({ index: idx, title: item.title, summary: item.summary })),
      ])
    )
  );
  let editorial: { intro: string; sectionOrder: Record<string, number[]> };
  try {
    const editRaw = await askClaude(EDITORIAL_PROMPT, editInput);
    editorial = parseJsonResponse<{
      intro: string;
      sectionOrder: Record<string, number[]>;
    }>(editRaw);
  } catch (err) {
    log.warn({ error: (err as Error).message }, "편집 AI 실패 — 기본값 사용");
    editorial = { intro: "", sectionOrder: {} };
  }

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
      items: ordered,
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

async function summarizeTier(
  allItems: ClassifiedItem[],
  tierItems: ClassifiedItem[],
  prompt: string,
  maxTokens: number,
  tierLabel: string
): Promise<Array<{
  index: number;
  titleKo?: string;
  summary: string;
  keyPoints?: string[];
  whyItMatters?: string;
}>> {
  const results: Array<{
    index: number;
    titleKo?: string;
    summary: string;
    keyPoints?: string[];
    whyItMatters?: string;
  }> = [];

  if (tierItems.length === 0) return results;

  // 원래 인덱스 매핑 (relevantItems 배열 내 위치)
  const originalIndices = tierItems.map((item) => allItems.indexOf(item));

  for (let batchStart = 0; batchStart < tierItems.length; batchStart += SUMMARIZE_BATCH_SIZE) {
    const batch = tierItems.slice(batchStart, batchStart + SUMMARIZE_BATCH_SIZE);
    const batchOriginalIndices = originalIndices.slice(batchStart, batchStart + SUMMARIZE_BATCH_SIZE);

    const batchInput = buildSummarizeInput(
      batch.map((item, localIdx) => ({
        index: localIdx,
        title: item.title,
        url: item.url,
        summary: item.summary,
        fullContent: item.fullContent,
        contentType: item.contentType,
      }))
    );

    log.info(
      { tier: tierLabel, batch: `${batchStart + 1}-${batchStart + batch.length}`, inputLength: batchInput.length },
      "배치 요약 요청"
    );

    try {
      const raw = await askClaude(prompt, batchInput, undefined, maxTokens);
      const parsed = parseJsonResponse<Array<{
        index: number;
        titleKo?: string;
        summary: string;
        keyPoints?: string[];
        whyItMatters?: string;
      }>>(raw);

      // 로컬 인덱스 → 원래 인덱스로 변환
      for (const entry of parsed) {
        const originalIndex = batchOriginalIndices[entry.index];
        if (originalIndex !== undefined) {
          results.push({ ...entry, index: originalIndex });
        }
      }
    } catch (err) {
      log.warn(
        { tier: tierLabel, batch: `${batchStart + 1}-${batchStart + batch.length}`, error: (err as Error).message },
        "배치 요약 실패 — 해당 배치 건너뜀"
      );
    }
  }

  return results;
}
