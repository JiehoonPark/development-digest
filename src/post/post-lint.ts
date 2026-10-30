/**
 * 모델 없이 판정할 수 있는 형식 검사. 사실 검증(fact-checker) 전에 돌려 비용 드는 단계를 아낀다.
 * 여기서 걸린 문제는 "error" 면 수정 요청, "warn" 이면 로그만 남긴다.
 */

export interface LintIssue {
  severity: "error" | "warn";
  rule: string;
  message: string;
}

export interface LintInput {
  title: string;
  dek: string;
  tldr: string[];
  body: string;
  actions: string[];
  /** 사용 가능한 출처 번호 */
  sourceIds: number[];
}

const MIN_BODY_CHARS = 2500;
const MIN_H2_COUNT = 2;
const MAX_POSTER_COUNT = 2;
const TLDR_RANGE = { min: 2, max: 4 };
const ACTIONS_RANGE = { min: 1, max: 4 };

/** 인사·과장·AI 티 나는 상투어 — 글 밀도 기준에서 금지한 표현 */
const BANNED_PHRASES = [
  "안녕하세요",
  "알아보겠습니다",
  "살펴보겠습니다",
  "혁신적인",
  "게임 체인저",
  "결론적으로",
  "마치며",
  "오늘은",
];

const CITATION_PATTERN = /\[(\d+)\]/g;

export function findCitationIds(text: string): number[] {
  return [...text.matchAll(CITATION_PATTERN)].map((match) => Number(match[1]));
}

/** 코드 블록 안의 `[0]` 같은 배열 인덱스를 인용으로 오인하지 않도록 코드를 지운다 */
export function stripCode(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

export function lintPost(input: LintInput): LintIssue[] {
  const issues: LintIssue[] = [];
  const prose = stripCode(input.body);
  const allProse = [prose, ...input.tldr.map(stripCode), ...input.actions.map(stripCode)].join("\n");

  if (input.body.length < MIN_BODY_CHARS) {
    issues.push({ severity: "error", rule: "body-length", message: `본문이 ${input.body.length}자로 너무 짧습니다(최소 ${MIN_BODY_CHARS}자)` });
  }

  if (/^#\s/m.test(prose)) {
    issues.push({ severity: "error", rule: "no-h1", message: "본문에 h1(# 제목)이 있습니다. 제목은 페이지가 따로 그립니다" });
  }

  const h2Count = (prose.match(/^##\s/gm) ?? []).length;
  if (h2Count < MIN_H2_COUNT) {
    issues.push({ severity: "error", rule: "h2-count", message: `## 소제목이 ${h2Count}개입니다(최소 ${MIN_H2_COUNT}개)` });
  }

  const allowedIds = new Set(input.sourceIds);
  const unknownIds = [...new Set(findCitationIds(allProse))].filter((id) => !allowedIds.has(id));
  if (unknownIds.length > 0) {
    issues.push({ severity: "error", rule: "unknown-citation", message: `없는 출처 번호를 인용했습니다: ${unknownIds.map((id) => `[${id}]`).join(", ")}` });
  }

  if (findCitationIds(prose).length === 0) {
    issues.push({ severity: "error", rule: "no-citation", message: "본문에 [n] 인용이 하나도 없습니다" });
  }

  const posterCount = (input.body.match(/^>\s*\[!POSTER\]/gm) ?? []).length;
  if (posterCount > MAX_POSTER_COUNT) {
    issues.push({ severity: "error", rule: "poster-count", message: `포스터 인용이 ${posterCount}개입니다(최대 ${MAX_POSTER_COUNT}개)` });
  }

  const fenceCount = (input.body.match(/^```/gm) ?? []).length;
  if (fenceCount % 2 !== 0) {
    issues.push({ severity: "error", rule: "unclosed-fence", message: "닫히지 않은 코드 블록이 있습니다" });
  }

  if (!inRange(input.tldr.length, TLDR_RANGE)) {
    issues.push({ severity: "error", rule: "tldr-count", message: `요약이 ${input.tldr.length}개입니다(${TLDR_RANGE.min}~${TLDR_RANGE.max}개)` });
  }

  if (!inRange(input.actions.length, ACTIONS_RANGE)) {
    issues.push({ severity: "warn", rule: "actions-count", message: `해 볼 것이 ${input.actions.length}개입니다(${ACTIONS_RANGE.min}~${ACTIONS_RANGE.max}개)` });
  }

  const bannedFound = BANNED_PHRASES.filter((phrase) => allProse.includes(phrase) || input.dek.includes(phrase));
  if (bannedFound.length > 0) {
    issues.push({ severity: "error", rule: "banned-phrase", message: `쓰지 않기로 한 표현이 있습니다: ${bannedFound.join(", ")}` });
  }

  if (input.title.length > 60) {
    issues.push({ severity: "warn", rule: "title-length", message: `제목이 ${input.title.length}자입니다(60자 이하 권장)` });
  }

  return issues;
}

function inRange(value: number, range: { min: number; max: number }): boolean {
  return value >= range.min && value <= range.max;
}

export function hasLintErrors(issues: LintIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error");
}
