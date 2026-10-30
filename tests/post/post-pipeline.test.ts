import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * 전체 흐름: 글감 선정 → 근거 수집 → 작성 → 형식 검사 → 사실 검증(1회 지적) → 수정 → 저장.
 * 모델·네트워크는 mock — 실제 비용 없이 단계 연결과 실패 처리만 확인한다.
 */

const claude = vi.hoisted(() => ({
  askClaude: vi.fn(),
  askClaudeComplete: vi.fn(),
}));

vi.mock("../../src/summarizer/claude-summarizer.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../src/summarizer/claude-summarizer.js")>();
  return { ...original, askClaude: claude.askClaude, askClaudeComplete: claude.askClaudeComplete };
});

const extractor = vi.hoisted(() => ({ extractArticle: vi.fn() }));
vi.mock("../../src/extractors/article-extractor.js", () => ({ extractArticle: extractor.extractArticle }));

import { runPostPipeline } from "../../src/post/post-pipeline.js";
import { FACT_CHECK_PROMPT, WRITE_PROMPT } from "../../src/post/prompts.js";
import type { PostCandidate, PostData } from "../../src/post/types.js";

const NOW = new Date("2026-10-30T23:00:00Z"); // KST 10/31 08:00
const TODAY = "2026-10-31";

const candidates: PostCandidate[] = [
  {
    url: "https://blog.example.com/range-syntax",
    title: "Stop using min-width",
    sourceName: "Example Blog",
    publishedAt: "2026-10-30T10:00:00Z",
    contentType: "article",
    labels: ["frontend"],
    relevance: 90,
    fullContent: "range syntax ".repeat(100),
  },
  {
    url: "https://nextjs.org/blog/security-release",
    title: "Upcoming security release",
    sourceName: "Next.js",
    publishedAt: "2026-10-29T10:00:00Z",
    contentType: "article",
    labels: ["frontend"],
    relevance: 70,
    summary: "security release on Nov 3",
  },
];

function section(title: string, citation: string): string {
  return `## ${title}\n\n${`범위 문법은 비교 연산자로 구간을 씁니다.${citation} 경계값을 직접 계산하지 않아도 되고 소수점 너비에서도 빈틈이 없습니다.\n\n`.repeat(24)}`;
}

function draftText(extra = ""): string {
  return `<slug>media query range</slug>
<title>767.98px은 이제 그만</title>
<dek>범위 문법으로 경계를 쓰는 방법을 정리했습니다.</dek>
<tags>CSS, 반응형</tags>
<tldr>
- 경계가 겹친다[2]
- 범위 문법을 쓴다[1]
</tldr>
<body>
${section("경계 문제", "[2]")}
${section("범위 문법", "[1]")}
## 정리

| 이전 | 이후 |
| --- | --- |
| \`max-width: 767.98px\` | \`width < 768px\` |
${extra}
</body>
<actions>
- 프로젝트에서 .98px 를 검색한다
</actions>
<cover>three white clay panels with a ruler</cover>
<coverAlt>흰색 패널 세 개와 자</coverAlt>`;
}

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "post-pipeline-"));
  process.env.POST_DATA_DIR = join(dir, "posts");
  process.env.POST_COVER_DIR = join(dir, "covers");
  delete process.env.OPENAI_API_KEY;

  extractor.extractArticle.mockImplementation(async (url: string) => {
    if (url === candidates[0].url) {
      return {
        url,
        status: "success",
        content: "원문 본문 ".repeat(200),
        wordCount: 400,
        title: "Stop using min-width",
        links: ["https://developer.mozilla.org/en-US/docs/Web/CSS/@media", "https://twitter.com/x/status/1"],
      };
    }
    return { url, status: "success", content: "MDN 문서 본문 ".repeat(100), wordCount: 200, title: "Using media queries" };
  });

  // MDN 검색 API
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ documents: [] }), { status: 200 }))
  );

  claude.askClaude.mockImplementation(async (system: string) => {
    if (system.includes("편집장")) {
      return JSON.stringify({ mainIndex: 0, angle: "경계를 어떻게 쓰나", mdnQueries: ["media queries"], briefs: [{ index: 1, label: "보안" }] });
    }
    return JSON.stringify([{ index: 0, title: "Next.js 11월 보안 릴리스 예정" }]);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  delete process.env.POST_DATA_DIR;
  delete process.env.POST_COVER_DIR;
  rmSync(dir, { recursive: true, force: true });
});

describe("runPostPipeline", () => {
  it("사실 검증 지적을 반영해 수정한 뒤 저장한다", async () => {
    let factChecks = 0;
    claude.askClaudeComplete.mockImplementation(async (system: string, input: string) => {
      if (system === FACT_CHECK_PROMPT) {
        factChecks++;
        return factChecks === 1
          ? JSON.stringify({ verdict: "fix", issues: [{ quote: "계산이 필요 없습니다", problem: "근거 없음", fix: "삭제" }] })
          : JSON.stringify({ verdict: "pass", issues: [] });
      }
      expect(system).toBe(WRITE_PROMPT);
      return input.includes("## 검토 의견") ? draftText("\n수정본입니다.[1]") : draftText();
    });

    const result = await runPostPipeline(candidates, NOW);

    expect(result).toMatchObject({ status: "published", slug: `${TODAY}-media-query-range`, revisions: 1 });
    const post = JSON.parse(readFileSync(join(dir, "posts", `${TODAY}-media-query-range.json`), "utf8")) as PostData;

    // [2](MDN) 가 먼저 인용됐으므로 1번이 된다
    expect(post.tldr).toEqual(["경계가 겹친다[1]", "범위 문법을 쓴다[2]"]);
    expect(post.sources.map((source) => source.url)).toEqual([
      "https://developer.mozilla.org/en-US/docs/Web/CSS/@media",
      candidates[0].url,
      candidates[1].url,
    ]);
    expect(post.body).toContain("수정본입니다.[2]");
    expect(post.briefs).toEqual([
      { label: "보안", title: "Next.js 11월 보안 릴리스 예정", note: "Next.js · 10월 29일", sourceId: 3 },
    ]);
    expect(post.cover).toBeUndefined(); // OPENAI_API_KEY 없음 → 커버 없이 발행
    expect(post.readingMinutes).toBeGreaterThan(0);
    // 트위터 링크는 근거로 따라가지 않는다
    expect(extractor.extractArticle).not.toHaveBeenCalledWith("https://twitter.com/x/status/1");
  });

  it("수정 한도를 넘기면 저장하지 않고 실패한다", async () => {
    claude.askClaudeComplete.mockImplementation(async (system: string) =>
      system === FACT_CHECK_PROMPT
        ? JSON.stringify({ verdict: "fix", issues: [{ quote: "x", problem: "틀림", fix: "삭제" }] })
        : draftText()
    );

    await expect(runPostPipeline(candidates, NOW)).rejects.toThrow(/검토를 통과하지 못했습니다/);
    expect(existsSync(join(dir, "posts")) ? readdirSync(join(dir, "posts")) : []).toEqual([]);
    // 작성 1 + 수정 2, 사실 검증 3
    expect(claude.askClaudeComplete).toHaveBeenCalledTimes(6);
  });

  it("형식 오류가 있으면 사실 검증을 건너뛰고 먼저 형식을 고치게 한다", async () => {
    const calls: string[] = [];
    claude.askClaudeComplete.mockImplementation(async (system: string, input: string) => {
      calls.push(system === FACT_CHECK_PROMPT ? "fact" : input.includes("## 검토 의견") ? "revise" : "write");
      if (system === FACT_CHECK_PROMPT) return JSON.stringify({ verdict: "pass", issues: [] });
      return calls.length === 1 ? draftText().replace("<dek>", "<dek>안녕하세요. ") : draftText();
    });

    await runPostPipeline(candidates, NOW);
    expect(calls).toEqual(["write", "revise", "fact"]);
    const reviseInput = claude.askClaudeComplete.mock.calls[1][1] as string;
    expect(reviseInput).toContain("[형식] 쓰지 않기로 한 표현");
  });

  it("오늘 글이 이미 있으면 모델을 부르지 않는다", async () => {
    const postsDir = join(dir, "posts");
    await import("fs").then(({ mkdirSync }) => mkdirSync(postsDir, { recursive: true }));
    writeFileSync(join(postsDir, `${TODAY}-existing.json`), JSON.stringify({ date: TODAY, sources: [] }));

    const result = await runPostPipeline(candidates, NOW);
    expect(result).toEqual({ status: "skipped", reason: `${TODAY} 글이 이미 있습니다` });
    expect(claude.askClaude).not.toHaveBeenCalled();
  });

  it("이미 근거로 쓴 원문은 후보에서 빼고, 남은 게 없으면 쉰다", async () => {
    const postsDir = join(dir, "posts");
    await import("fs").then(({ mkdirSync }) => mkdirSync(postsDir, { recursive: true }));
    writeFileSync(
      join(postsDir, "2026-10-28-old.json"),
      JSON.stringify({ date: "2026-10-28", title: "옛 글", tags: [], sources: candidates.map((c, i) => ({ id: i + 1, url: c.url })) })
    );

    const result = await runPostPipeline(candidates, NOW);
    expect(result.status).toBe("skipped");
    expect(claude.askClaude).not.toHaveBeenCalled();
  });

  it("원문 본문을 못 얻으면 글을 쓰지 않는다", async () => {
    extractor.extractArticle.mockResolvedValue({ url: "", status: "failed", content: "", wordCount: 0 });
    const shortCandidates = [{ ...candidates[0], fullContent: "짧음" }, candidates[1]];

    await expect(runPostPipeline(shortCandidates, NOW)).rejects.toThrow(/원문 본문을 확보하지 못했습니다/);
    expect(claude.askClaudeComplete).not.toHaveBeenCalled();
  });
});
