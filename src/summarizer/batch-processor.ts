import pMap from "p-map";
import type { ScoredItem } from "../prioritizer/scoring.js";
import { askClaude, parseJsonResponse } from "./claude-summarizer.js";
import { buildFilterInput, buildArticleInput, buildSummarizeInput, buildEditorialInput } from "./prompt-builder.js";
import { FILTER_PROMPT, ARTICLE_PROMPT, SUMMARIZE_BRIEF_PROMPT, EDITORIAL_PROMPT } from "../../config/prompts.js";
import { getRecentTitles } from "../db/repositories/recent-titles.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("batch-processor");

// FE 중심 선별: 분류(라벨링)는 전 건, 발행은 relevance 상위만
const RELEVANCE_CUTOFF = 55;
const MAX_DIGEST_ITEMS = 15;

const SUMMARIZE_BATCH_SIZE = 8;

// 아티클 생성: 본문이 확보된 아이템만, 건당 1회 Sonnet 호출
const ARTICLE_MODEL = "claude-sonnet-5";
const ARTICLE_MIN_CONTENT = 500;
const ARTICLE_CONCURRENCY = 3;

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
  article?: string;
  engagement?: number;
  contentType: string;
  labels?: string[];
  relevance?: number;
  topicId?: string;
  isTopicPrimary?: boolean;
  relatedCount?: number;
}

export interface DigestResult {
  intro: string;
  sections: DigestSection[];
}

export interface ClassifiedItem extends ScoredItem {
  aiCategory: DigestSection["category"];
  labels: string[];
  relevance: number;
  topicId?: string;
  isTopicPrimary?: boolean;
  relatedCount: number;
}

interface SummaryEntry {
  titleKo?: string;
  summary: string;
  keyPoints?: string[];
  whyItMatters?: string;
  article?: string;
}

/**
 * Step 1: 분류 + 라벨 + 토픽 클러스터링 후 FE 관련도 기준으로 실제 선별.
 * 제목만으로 판단 가능하므로 본문 추출 전에 실행 — 탈락 아이템은 추출 비용도 안 씀.
 */
export async function classifyItems(items: ScoredItem[]): Promise<ClassifiedItem[]> {
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

  // 토픽별 카운트 (선별 전 전체 기준 — "관련 N건" 배지용)
  const topicCounts = new Map<string, number>();
  for (const c of classified) {
    if (c.topicId) {
      topicCounts.set(c.topicId, (topicCounts.get(c.topicId) ?? 0) + 1);
    }
  }

  const all: ClassifiedItem[] = items
    .map((item, i) => {
      const cls = classifyMap.get(i);
      const topicId = cls?.topicId ?? undefined;
      return {
        ...item,
        aiCategory: (cls?.category ?? "insight") as DigestSection["category"],
        labels: cls?.labels ?? ["general"],
        relevance: cls?.relevance ?? 50,
        topicId,
        isTopicPrimary: cls?.isTopicPrimary ?? true,
        relatedCount: topicId ? (topicCounts.get(topicId) ?? 1) - 1 : 0,
      };
    })
    .sort((a, b) => b.relevance - a.relevance);

  const selected = all.filter((item) => item.relevance >= RELEVANCE_CUTOFF).slice(0, MAX_DIGEST_ITEMS);

  log.info(
    {
      total: all.length,
      selected: selected.length,
      dropped: all.length - selected.length,
      cutoff: RELEVANCE_CUTOFF,
      topRelevance: selected[0]?.relevance,
      bottomRelevance: selected[selected.length - 1]?.relevance,
    },
    "FE 관련도 선별 완료"
  );

  return selected;
}

/**
 * Step 2-3: 본문 있는 아이템은 아티클 생성(Sonnet, 건당 1회 — 요약/번역 겸함),
 * 본문 없는 아이템은 간략 요약(Haiku, 배치). 이후 편집(도입부 + 순서).
 */
export async function composeDigest(items: ClassifiedItem[]): Promise<DigestResult> {
  const articleItems = items.filter((it) => (it.fullContent?.length ?? 0) >= ARTICLE_MIN_CONTENT);
  const briefItems = items.filter((it) => !articleItems.includes(it));

  log.info(
    { article: articleItems.length, brief: briefItems.length },
    "Step 2: 아티클/간략 티어 분리"
  );

  const summaryByUrl = new Map<string, SummaryEntry>();

  const articleResults = await pMap(
    articleItems,
    async (item) => {
      try {
        const raw = await askClaude(ARTICLE_PROMPT, buildArticleInput(item), ARTICLE_MODEL, 8192);
        const entry = parseArticleResponse(raw);
        log.info({ title: item.title.slice(0, 40), articleLength: entry.article?.length }, "아티클 생성 완료");
        return { url: item.url, entry };
      } catch (err) {
        log.warn({ title: item.title, error: (err as Error).message }, "아티클 생성 실패 — 간략 요약으로 폴백");
        return { url: item.url, entry: null };
      }
    },
    { concurrency: ARTICLE_CONCURRENCY }
  );

  const briefQueue = [...briefItems];
  for (const r of articleResults) {
    if (r.entry) {
      summaryByUrl.set(r.url, r.entry);
    } else {
      const failed = articleItems.find((it) => it.url === r.url);
      if (failed) briefQueue.push(failed);
    }
  }

  await summarizeBrief(briefQueue, summaryByUrl);

  // 섹션별 그룹화 (items 는 relevance 내림차순)
  const sections: Record<string, DigestItem[]> = { hot: [], tech: [], insight: [], video: [] };

  for (const item of items) {
    const entry = summaryByUrl.get(item.url);
    sections[item.aiCategory]?.push({
      title: item.title,
      titleKo: entry?.titleKo,
      summary: entry?.summary ?? item.summary ?? "",
      keyPoints: entry?.keyPoints ?? [],
      whyItMatters: entry?.whyItMatters,
      article: entry?.article,
      url: item.url,
      sourceName: item.sourceName,
      engagement: item.engagement,
      contentType: item.contentType,
      labels: item.labels,
      relevance: item.relevance,
      topicId: item.topicId,
      isTopicPrimary: item.isTopicPrimary,
      relatedCount: item.relatedCount > 0 ? item.relatedCount : undefined,
    });
  }

  // Step 3: 편집 (도입부 + 순서)
  log.info("Step 3: 편집");
  const editInput = buildEditorialInput(
    Object.fromEntries(
      Object.entries(sections).map(([key, sectionItems]) => [
        key,
        sectionItems.map((item, idx) => ({ index: idx, title: item.title, summary: item.summary })),
      ])
    )
  );
  let editorial: { intro: string; sectionOrder: Record<string, number[]> };
  try {
    const editRaw = await askClaude(EDITORIAL_PROMPT, editInput);
    editorial = parseJsonResponse<{ intro: string; sectionOrder: Record<string, number[]> }>(editRaw);
  } catch (err) {
    log.warn({ error: (err as Error).message }, "편집 AI 실패 — 기본값 사용");
    editorial = { intro: "", sectionOrder: {} };
  }

  const finalSections: DigestSection[] = [];
  for (const cat of ["hot", "tech", "insight", "video"] as const) {
    const sectionItems = sections[cat];
    if (sectionItems.length === 0) continue;

    const order = editorial.sectionOrder?.[cat] ?? sectionItems.map((_, i) => i);
    const ordered = order
      .filter((idx) => idx < sectionItems.length)
      .map((idx) => sectionItems[idx])
      .filter(Boolean);

    finalSections.push({ category: cat, items: ordered });
  }

  log.info(
    { sections: finalSections.map((s) => `${s.category}:${s.items.length}`) },
    "AI 처리 완료"
  );

  return { intro: editorial.intro, sections: finalSections };
}

/**
 * 아티클 응답 파싱: 마크다운 본문 + 말미의 ```json 메타 블록.
 * 메타 파싱이 실패해도 아티클 본문은 살린다. (export: 테스트용)
 */
export function parseArticleResponse(raw: string): SummaryEntry {
  // 마지막 ```json 블록만 메타로 취급 — 본문 중간의 json 코드 블록을 오인하지 않도록
  let article = raw.trim();
  let meta: Partial<SummaryEntry> = {};

  const fenceIdx = raw.lastIndexOf("```json");
  if (fenceIdx !== -1) {
    const tailMatch = raw.slice(fenceIdx).match(/^```json\s*([\s\S]*?)\s*```\s*$/);
    if (tailMatch) {
      article = raw.slice(0, fenceIdx).trim();
      try {
        meta = JSON.parse(tailMatch[1]);
      } catch {
        log.warn({ tail: tailMatch[1].slice(0, 200) }, "아티클 메타 JSON 파싱 실패 — 본문만 사용");
      }
    }
  }

  if (article.length === 0) {
    throw new Error("아티클 본문이 비어 있음");
  }

  // summary 폴백: 아티클 첫 문단 (마크다운 기호 제거)
  const firstParagraph = article
    .split(/\n{2,}/)[0]
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`]/g, "")
    .trim();

  return {
    titleKo: meta.titleKo,
    summary: meta.summary ?? firstParagraph.slice(0, 300),
    keyPoints: meta.keyPoints ?? [],
    whyItMatters: meta.whyItMatters,
    article,
  };
}

async function summarizeBrief(
  items: ClassifiedItem[],
  summaryByUrl: Map<string, SummaryEntry>
): Promise<void> {
  for (let batchStart = 0; batchStart < items.length; batchStart += SUMMARIZE_BATCH_SIZE) {
    const batch = items.slice(batchStart, batchStart + SUMMARIZE_BATCH_SIZE);

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
      { batch: `${batchStart + 1}-${batchStart + batch.length}`, inputLength: batchInput.length },
      "간략 요약 배치 요청"
    );

    try {
      const raw = await askClaude(SUMMARIZE_BRIEF_PROMPT, batchInput, undefined, 8192);
      const parsed = parseJsonResponse<Array<{
        index: number;
        titleKo?: string;
        summary: string;
        keyPoints?: string[];
        whyItMatters?: string;
      }>>(raw);

      for (const entry of parsed) {
        const item = batch[entry.index];
        if (item) {
          summaryByUrl.set(item.url, entry);
        }
      }
    } catch (err) {
      log.warn(
        { batch: `${batchStart + 1}-${batchStart + batch.length}`, error: (err as Error).message },
        "간략 요약 배치 실패 — 해당 배치 건너뜀"
      );
    }
  }
}
