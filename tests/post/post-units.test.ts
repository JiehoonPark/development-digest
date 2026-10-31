import { describe, expect, it } from "vitest";
import { hasLintErrors, lintPost, stripCode } from "../../src/post/post-lint.js";
import { renumberCitations } from "../../src/post/citations.js";
import { estimateReadingMinutes, parseDraft, serializeDraft, toSlug } from "../../src/post/draft.js";
import { pickFollowLinks } from "../../src/post/research.js";
import { formatKstDate } from "../../src/post/kst-date.js";

const SECTION = "범위 문법은 비교 연산자로 구간을 씁니다.[1] 경계값을 직접 계산하지 않아도 됩니다. 소수점 너비에서도 빈틈이 생기지 않습니다.\n\n";
const GOOD_BODY = [
  "## 경계가 왜 문제인가",
  SECTION.repeat(20),
  "```css\n@media (width < 768px) { .nav { display: none; } } /* arr[0] */\n```",
  "## 범위 문법",
  SECTION.repeat(20),
  "## 정리",
  "| 이전 | 이후 |\n| --- | --- |\n| `max-width: 767.98px` | `width < 768px` |",
].join("\n\n");

const goodInput = {
  title: "767.98px은 이제 그만",
  dek: "범위 문법으로 경계를 쓰는 방법을 정리했습니다.",
  tldr: ["경계가 겹친다[1]", "범위 문법을 쓴다[2]"],
  body: GOOD_BODY,
  actions: ["프로젝트에서 .98px 를 검색한다"],
  sourceIds: [1, 2],
};

describe("lintPost", () => {
  it("기준을 지킨 글은 오류가 없다", () => {
    expect(hasLintErrors(lintPost(goodInput))).toBe(false);
  });

  it("없는 출처 번호 인용을 잡는다", () => {
    const issues = lintPost({ ...goodInput, tldr: ["근거 없는 주장[7]", "둘째[1]"] });
    expect(issues.map((issue) => issue.rule)).toContain("unknown-citation");
  });

  it("코드 블록 안의 배열 인덱스는 인용으로 보지 않는다", () => {
    expect(stripCode("본문[1] `arr[3]`\n```js\nlist[9]\n```")).not.toContain("[3]");
    const issues = lintPost({ ...goodInput, sourceIds: [1, 2] });
    expect(issues.map((issue) => issue.rule)).not.toContain("unknown-citation");
  });

  it("인사·상투어, h1, 짧은 본문, 포스터 과다를 잡는다", () => {
    const poster = "> [!POSTER]\n> 머리말\n> 핵심\n\n";
    const issues = lintPost({
      ...goodInput,
      dek: "안녕하세요, 오늘은 범위 문법을 알아보겠습니다.",
      body: `# 제목\n\n${poster.repeat(3)}짧은 본문[1]`,
    });
    const rules = issues.map((issue) => issue.rule);
    expect(rules).toEqual(expect.arrayContaining(["banned-phrase", "no-h1", "body-length", "poster-count", "h2-count"]));
  });

  it("닫히지 않은 코드 블록을 잡는다", () => {
    const issues = lintPost({ ...goodInput, body: `${GOOD_BODY}\n\n\`\`\`js\nconst a = 1;` });
    expect(issues.map((issue) => issue.rule)).toContain("unclosed-fence");
  });
});

describe("renumberCitations", () => {
  const sources = [1, 2, 3, 4].map((id) => ({ id, title: `자료${id}`, url: `https://example.com/${id}` }));

  it("처음 인용된 순서로 1부터 다시 매기고, 안 쓴 출처는 뺀다", () => {
    const result = renumberCitations({
      tldr: ["요약[3]"],
      body: "본문[1] 그리고[3]",
      actions: [],
      sources,
    });
    expect(result.tldr).toEqual(["요약[1]"]);
    expect(result.body).toBe("본문[2] 그리고[1]");
    expect(result.sources.map((source) => [source.id, source.title])).toEqual([
      [1, "자료3"],
      [2, "자료1"],
    ]);
  });

  it("짧은 소식이 가리키는 출처는 인용되지 않아도 남긴다", () => {
    const result = renumberCitations({ tldr: [], body: "본문[2]", actions: [], sources, keepIds: [4] });
    expect(result.sources.map((source) => source.title)).toEqual(["자료2", "자료4"]);
    expect(result.idMap.get(4)).toBe(2);
  });

  it("코드 안의 대괄호 숫자는 바꾸지 않는다", () => {
    const result = renumberCitations({
      tldr: [],
      body: "본문[3]\n\n```js\nconst x = list[1];\n```\n\n`arr[1]`",
      actions: [],
      sources,
    });
    expect(result.body).toBe("본문[1]\n\n```js\nconst x = list[1];\n```\n\n`arr[1]`");
  });
});

describe("parseDraft", () => {
  const raw = `서론 잡담
<slug>Media Query Range Syntax!</slug>
<title>767.98px은 이제 그만</title>
<dek>범위 문법을 정리했습니다.</dek>
<tags>CSS, 반응형</tags>
<tldr>
- 첫째[1]
- 둘째[2]
</tldr>
<body>
## 소제목

본문에 <body> 라는 문자열이 있어도 된다.
</body>
<actions>
- 검색한다
</actions>
<cover>{"logos":["css"],"keyword":"@media"}</cover>
<coverAlt>흰색 패널 세 개</coverAlt>`;

  it("태그를 읽고 slug 를 정규화한다", () => {
    const draft = parseDraft(raw);
    expect(draft.slug).toBe("media-query-range-syntax");
    expect(draft.tags).toEqual(["CSS", "반응형"]);
    expect(draft.tldr).toEqual(["첫째[1]", "둘째[2]"]);
    expect(draft.body).toContain("<body> 라는 문자열");
    expect(JSON.parse(draft.coverSpec)).toEqual({ logos: ["css"], keyword: "@media" });
  });

  it("직렬화 후 다시 읽어도 같다", () => {
    const draft = parseDraft(raw);
    expect(parseDraft(serializeDraft(draft))).toEqual(draft);
  });

  it("필수 태그가 빠지면 실패한다", () => {
    expect(() => parseDraft("<title>제목만</title>")).toThrow(/빠진 태그/);
  });

  it("slug 는 6단어까지", () => {
    expect(toSlug("one two three four five six seven")).toBe("one-two-three-four-five-six");
  });

  it("읽는 시간은 최소 1분, 코드는 가중", () => {
    expect(estimateReadingMinutes("짧음")).toBe(1);
    const prose = "가".repeat(2500);
    const code = `\`\`\`\n${"x".repeat(1000)}\n\`\`\``;
    expect(estimateReadingMinutes(prose + code)).toBeGreaterThan(estimateReadingMinutes(prose));
  });
});

describe("pickFollowLinks", () => {
  it("1차 자료 도메인의 구체적인 페이지만 고른다", () => {
    const links = [
      "https://developer.mozilla.org/en-US/docs/Web/CSS/@media",
      "https://github.com/twbs/bootstrap",
      "https://github.com/twbs/bootstrap/blob/v5.3.3/scss/mixins/_breakpoints.scss",
      "https://twitter.com/someone/status/1",
      "https://evil-developer.mozilla.org.example.com/x",
      "https://blog.example.com/post",
    ];
    expect(pickFollowLinks(links, "https://blog.example.com/post")).toEqual([
      "https://developer.mozilla.org/en-US/docs/Web/CSS/@media",
      "https://github.com/twbs/bootstrap/blob/v5.3.3/scss/mixins/_breakpoints.scss",
    ]);
  });
});

describe("formatKstDate", () => {
  it("UTC 23시(KST 다음날 8시)는 KST 날짜로", () => {
    expect(formatKstDate(new Date("2026-10-29T23:00:00Z"))).toBe("2026-10-30");
  });
});
