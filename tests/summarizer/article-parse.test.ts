import { describe, it, expect } from "vitest";
import { parseArticleResponse } from "../../src/summarizer/batch-processor.js";

const ARTICLE = `도입 문단입니다. 이 글은 popover 를 다룹니다.

## 핵심 동작

\`\`\`html
<div popover></div>
\`\`\`

## 정리

- 요점 하나`;

describe("parseArticleResponse", () => {
  it("본문 + json 메타 블록을 분리한다", () => {
    const raw = `${ARTICLE}\n\n\`\`\`json\n{"titleKo":"제목","summary":"요약","keyPoints":["a"],"whyItMatters":"중요"}\n\`\`\``;
    const r = parseArticleResponse(raw);
    expect(r.article).toBe(ARTICLE);
    expect(r.titleKo).toBe("제목");
    expect(r.summary).toBe("요약");
    expect(r.keyPoints).toEqual(["a"]);
  });

  it("메타 블록이 없으면 첫 문단을 summary 폴백으로 쓴다", () => {
    const r = parseArticleResponse(ARTICLE);
    expect(r.article).toBe(ARTICLE);
    expect(r.summary).toContain("도입 문단입니다");
    expect(r.keyPoints).toEqual([]);
  });

  it("메타 JSON이 깨져도 본문은 살린다", () => {
    const raw = `${ARTICLE}\n\n\`\`\`json\n{"titleKo": 깨진 JSON\n\`\`\``;
    const r = parseArticleResponse(raw);
    expect(r.article).toBe(ARTICLE);
    expect(r.summary.length).toBeGreaterThan(0);
  });

  it("본문 안의 json 코드 블록은 건드리지 않는다 (말미 블록만 메타)", () => {
    const withInnerJson = `설명 문단.\n\n\`\`\`json\n{"config": true}\n\`\`\`\n\n마무리 문단.`;
    const r = parseArticleResponse(withInnerJson);
    expect(r.article).toBe(withInnerJson);
  });

  it("본문 안에 json 블록이 있어도 말미 메타만 분리한다", () => {
    const withInnerJson = `설명 문단.\n\n\`\`\`json\n{"config": true}\n\`\`\`\n\n마무리 문단.`;
    const raw = `${withInnerJson}\n\n\`\`\`json\n{"titleKo":"제목","summary":"요약"}\n\`\`\``;
    const r = parseArticleResponse(raw);
    expect(r.article).toBe(withInnerJson);
    expect(r.titleKo).toBe("제목");
  });

  it("본문이 비면 던진다", () => {
    expect(() => parseArticleResponse("```json\n{}\n```")).toThrow();
  });
});
