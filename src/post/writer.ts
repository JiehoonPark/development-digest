import { askClaudeComplete, parseJsonResponse } from "../summarizer/claude-summarizer.js";
import { createChildLogger } from "../utils/logger.js";
import { parseDraft, serializeDraft, type PostDraft } from "./draft.js";
import { hasLintErrors, lintPost, type LintIssue } from "./post-lint.js";
import { FACT_CHECK_PROMPT, REVISE_INSTRUCTION, WRITE_PROMPT } from "./prompts.js";
import type { ResearchSource } from "./types.js";

const log = createChildLogger("post-writer");

const WRITE_MODEL = "claude-opus-5";
const FACT_CHECK_MODEL = "claude-sonnet-5";
const WRITE_MAX_TOKENS = 32000;
const FACT_CHECK_MAX_TOKENS = 4000;
/** 첫 작성 뒤 수정 기회. 넘기면 발행하지 않는다 — 검증 못 한 글을 내보내지 않기 위해 */
const MAX_REVISIONS = 2;

export interface FactIssue {
  quote: string;
  problem: string;
  fix: string;
}

interface FactCheckResponse {
  verdict: "pass" | "fix";
  issues: FactIssue[];
}

export interface WrittenPost {
  draft: PostDraft;
  revisions: number;
  /** 마지막 검사에서 남은 경고(발행은 막지 않음) */
  warnings: LintIssue[];
}

function formatSources(sources: ResearchSource[]): string {
  return sources
    .map((source) =>
      [`[${source.id}] ${source.title}`, `출처: ${source.publisher} · ${source.url}`, source.content].join("\n")
    )
    .join("\n\n=====\n\n");
}

function buildWriteInput(angle: string, sources: ResearchSource[]): string {
  return [`## 이 글이 답할 질문\n${angle || "자료 [1] 의 핵심을 실무 관점에서 설명"}`, `## 자료\n${formatSources(sources)}`].join(
    "\n\n"
  );
}

function lintDraft(draft: PostDraft, sources: ResearchSource[]): LintIssue[] {
  return lintPost({
    title: draft.title,
    dek: draft.dek,
    tldr: draft.tldr,
    body: draft.body,
    actions: draft.actions,
    sourceIds: sources.map((source) => source.id),
  });
}

async function factCheck(draft: PostDraft, sources: ResearchSource[]): Promise<FactCheckResponse> {
  const input = `## 자료\n${formatSources(sources)}\n\n## 초안\n${serializeDraft(draft)}`;
  const raw = await askClaudeComplete(FACT_CHECK_PROMPT, input, FACT_CHECK_MODEL, FACT_CHECK_MAX_TOKENS);
  const response = parseJsonResponse<FactCheckResponse>(raw);
  return { verdict: response.verdict, issues: response.issues ?? [] };
}

function formatFeedback(lintIssues: LintIssue[], factIssues: FactIssue[]): string {
  const lines = [
    ...lintIssues.filter((issue) => issue.severity === "error").map((issue) => `- [형식] ${issue.message}`),
    ...factIssues.map((issue) => `- [사실] "${issue.quote}" — ${issue.problem} → ${issue.fix}`),
  ];
  return lines.join("\n");
}

async function revise(draft: PostDraft, sources: ResearchSource[], angle: string, feedback: string): Promise<PostDraft> {
  const input = [
    buildWriteInput(angle, sources),
    `## 지금 초안\n${serializeDraft(draft)}`,
    `## 검토 의견\n${feedback}`,
    REVISE_INSTRUCTION,
  ].join("\n\n");
  return parseDraft(await askClaudeComplete(WRITE_PROMPT, input, WRITE_MODEL, WRITE_MAX_TOKENS));
}

/**
 * 작성 → (형식 검사 → 사실 검증 → 수정) 반복.
 * 형식 오류가 남아 있으면 비용이 드는 사실 검증을 건너뛰고 먼저 형식부터 고치게 한다.
 */
export async function writePost(angle: string, sources: ResearchSource[]): Promise<WrittenPost> {
  let draft = parseDraft(await askClaudeComplete(WRITE_PROMPT, buildWriteInput(angle, sources), WRITE_MODEL, WRITE_MAX_TOKENS));

  for (let revision = 0; ; revision++) {
    const lintIssues = lintDraft(draft, sources);
    const factIssues = hasLintErrors(lintIssues) ? [] : (await factCheck(draft, sources)).issues;
    const isClean = !hasLintErrors(lintIssues) && factIssues.length === 0;

    log.info(
      {
        revision,
        lintErrors: lintIssues.filter((issue) => issue.severity === "error").map((issue) => issue.rule),
        factIssues: factIssues.length,
      },
      "초안 검토"
    );

    if (isClean) {
      return { draft, revisions: revision, warnings: lintIssues };
    }
    if (revision >= MAX_REVISIONS) {
      throw new Error(`수정 ${MAX_REVISIONS}회 뒤에도 검토를 통과하지 못했습니다:\n${formatFeedback(lintIssues, factIssues)}`);
    }

    draft = await revise(draft, sources, angle, formatFeedback(lintIssues, factIssues));
  }
}
