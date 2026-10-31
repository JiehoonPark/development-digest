import { askClaude, parseJsonResponse } from "../summarizer/claude-summarizer.js";
import { createChildLogger } from "../utils/logger.js";
import { BRIEF_PROMPT, TOPIC_PROMPT } from "./prompts.js";
import type { PostCandidate, PostData } from "./types.js";

const log = createChildLogger("post-topic");

const TOPIC_MODEL = "claude-sonnet-5";
const MAX_CANDIDATES = 15;
const MAX_BRIEFS = 3;
const CONTENT_PREVIEW_CHARS = 400;

export interface TopicChoice {
  main: PostCandidate;
  angle: string;
  mdnQueries: string[];
  briefs: Array<{ candidate: PostCandidate; label: string }>;
}

interface TopicResponse {
  mainIndex: number | null;
  reason?: string;
  angle?: string;
  mdnQueries?: string[];
  briefs?: Array<{ index: number; label: string }>;
}

function buildTopicInput(candidates: PostCandidate[], recentPosts: PostData[]): string {
  const recent = recentPosts.length
    ? recentPosts.map((post) => `- ${post.date} ${post.title} (태그: ${post.tags.join(", ")})`).join("\n")
    : "- 없음";

  const list = candidates
    .map((candidate, index) =>
      [
        `[${index}] ${candidate.title}`,
        `    출처: ${candidate.sourceName} · 유형: ${candidate.contentType} · 라벨: ${candidate.labels.join(", ")} · 관련도: ${candidate.relevance}`,
        `    본문 길이: ${candidate.fullContent?.length ?? 0}자`,
        `    미리보기: ${(candidate.fullContent ?? candidate.summary ?? "").slice(0, CONTENT_PREVIEW_CHARS).replace(/\s+/g, " ")}`,
      ].join("\n")
    )
    .join("\n\n");

  return `## 최근 쓴 글\n${recent}\n\n## 오늘 후보\n${list}`;
}

/** 오늘 깊게 쓸 글감과 짧은 소식을 고른다. 고를 만한 게 없으면 null — 억지로 쓰지 않는다 */
export async function chooseTopic(candidates: PostCandidate[], recentPosts: PostData[]): Promise<TopicChoice | null> {
  const pool = candidates.slice(0, MAX_CANDIDATES);
  if (pool.length === 0) return null;

  const raw = await askClaude(TOPIC_PROMPT, buildTopicInput(pool, recentPosts), TOPIC_MODEL, 1024);
  const response = parseJsonResponse<TopicResponse>(raw);

  const main = response.mainIndex === null ? undefined : pool[response.mainIndex];
  if (!main) {
    log.warn({ reason: response.reason }, "오늘 깊게 쓸 글감 없음");
    return null;
  }

  const briefs = (response.briefs ?? [])
    .filter((brief) => brief.index !== response.mainIndex && pool[brief.index])
    .slice(0, MAX_BRIEFS)
    .map((brief) => ({ candidate: pool[brief.index], label: brief.label }));

  log.info({ main: main.title, angle: response.angle, briefs: briefs.length }, "글감 선정");
  return {
    main,
    angle: response.angle ?? "",
    mdnQueries: response.mdnQueries ?? [],
    briefs,
  };
}

/** 짧은 소식 제목을 한국어로. 실패하면 원문 제목을 그대로 쓴다 — 소식 때문에 발행을 막지 않는다 */
export async function titleBriefs(briefs: PostCandidate[]): Promise<string[]> {
  const fallback = briefs.map((brief) => brief.titleKo ?? brief.title);
  if (briefs.length === 0) return fallback;

  const input = briefs
    .map((brief, index) => `[${index}] ${brief.title}\n    요약: ${(brief.summary ?? brief.fullContent ?? "").slice(0, 300)}`)
    .join("\n\n");

  try {
    const parsed = parseJsonResponse<Array<{ index: number; title: string }>>(await askClaude(BRIEF_PROMPT, input));
    return fallback.map((original, index) => parsed.find((entry) => entry.index === index)?.title?.trim() || original);
  } catch (error) {
    log.warn({ error: (error as Error).message }, "짧은 소식 제목 번역 실패 — 원문 제목 사용");
    return fallback;
  }
}
