import { describe, expect, it } from "vitest";
import { chooseCoverStyle, COVER_STYLES, parseCoverSpec, usableStyles } from "../../src/post/cover/cover-spec.js";
import { resolveMotif } from "../../src/post/cover/motifs.js";
import { renderCoverHtml } from "../../src/post/cover/templates.js";

const ctx = { title: "미디어 쿼리 범위 문법", tags: ["CSS"] };

const full = {
  logos: ["css", "typescript"],
  keyword: "범위 문법",
  headline: "767.98px은 이제 그만",
  code: "@media (width < 768px) {\n  .nav { display: none; }\n}",
  codeFile: "breakpoints.css",
  before: "max-width: 767.98px",
  after: "width < 768px",
  stat: "30개월",
  statLabel: "Baseline 신규에서 널리 사용 가능까지",
};

describe("parseCoverSpec", () => {
  it("모르는 로고는 버리고 중복을 지운다(최대 3개)", () => {
    const spec = parseCoverSpec(JSON.stringify({ logos: ["CSS", "css", "unknown-lib", "react", "vue", "svelte"] }), ctx);
    expect(spec.logos).toEqual(["css", "react", "vue"]);
  });

  it("JSON 이 깨지면 빈 재료 + 대체 키워드", () => {
    const spec = parseCoverSpec("not json", ctx);
    expect(spec.logos).toEqual([]);
    expect(spec.keyword).toBe("CSS");
  });

  it("글 제목·태그를 담고, 대체 키워드는 첫 태그", () => {
    const spec = parseCoverSpec("{}", ctx);
    expect(spec.title).toBe(ctx.title);
    expect(spec.keyword).toBe("CSS");
  });

  it("너무 긴 키워드는 대체 키워드로", () => {
    expect(parseCoverSpec(JSON.stringify({ keyword: "x".repeat(60) }), ctx).keyword).toBe("CSS");
  });
});

describe("usableStyles / chooseCoverStyle", () => {
  it("재료가 모두 있으면 다섯 형식 모두 후보", () => {
    expect(usableStyles(parseCoverSpec(JSON.stringify(full), ctx))).toEqual(["code", "compare", "stat", "logos", "typography"]);
  });

  it("너무 긴 코드·비교 문구는 후보에서 뺀다", () => {
    const spec = parseCoverSpec(JSON.stringify({ ...full, code: "a".repeat(80) + "\nb", before: "x".repeat(50) }), ctx);
    expect(usableStyles(spec)).not.toContain("code");
    expect(usableStyles(spec)).not.toContain("compare");
  });

  it("최근 글에서 가장 오래 안 쓴 형식을 고른다", () => {
    const spec = parseCoverSpec(JSON.stringify(full), ctx);
    expect(chooseCoverStyle(spec, [])).toBe("code");
    expect(chooseCoverStyle(spec, ["code"])).toBe("compare");
    expect(chooseCoverStyle(spec, ["compare", "code", "stat", "logos"])).toBe("typography");
    // 모두 썼으면 가장 오래전에 쓴 것
    expect(chooseCoverStyle(spec, ["typography", "compare", "code", "stat", "logos"])).toBe("logos");
  });

  it("맞는 재료가 없으면 기본형 둘(팝아트·로고+빛)을 번갈아 쓴다", () => {
    const spec = parseCoverSpec(JSON.stringify({ logos: ["react"], keyword: "useEffectEvent" }), ctx);
    expect(chooseCoverStyle(spec, [])).toBe("pop");
    expect(chooseCoverStyle(spec, ["pop"])).toBe("logo-glow");
    expect(chooseCoverStyle(spec, ["logo-glow", "pop"])).toBe("pop");
  });

  it("로고가 없으면 로고+빛은 그릴 수 없어 늘 팝아트", () => {
    const spec = parseCoverSpec(JSON.stringify({ keyword: "State of JS" }), ctx);
    expect(chooseCoverStyle(spec, ["pop"])).toBe("pop");
  });
});

describe("resolveMotif", () => {
  const motifOf = (input: object, context = ctx) => resolveMotif(parseCoverSpec(JSON.stringify(input), context));

  it("모델이 고른 그림이 있으면 그대로", () => {
    expect(motifOf({ logos: ["css"], motif: "speed" })).toBe("speed");
  });

  it("모르는 그림 이름은 무시하고 자동으로 정한다", () => {
    expect(motifOf({ logos: ["css"], motif: "rocket" })).toBe("layout");
  });

  it("보안 소식은 주인공 기술보다 보안 그림이 먼저", () => {
    expect(motifOf({ logos: ["react"] }, { title: "RSC 보안 패치", tags: ["React"] })).toBe("security");
  });

  it("로고가 없으면 제목·태그로 짐작하고, 그래도 없으면 burst", () => {
    expect(motifOf({}, { title: "코드 리뷰를 에이전트에게", tags: [] })).toBe("ai");
    expect(motifOf({}, { title: "번들 크기 줄이기", tags: [] })).toBe("speed");
    // "State of JS" 의 state 는 상태 관리가 아니다
    expect(motifOf({ keyword: "State of JS" }, { title: "연례 설문 결과", tags: ["커뮤니티"] })).toBe("burst");
  });
});

describe("renderCoverHtml", () => {
  it("팝아트 큰 글자는 headline, 없으면 제목의 부제 앞부분", () => {
    const withTitle = parseCoverSpec("{}", { title: "RSC 보안 패치 — 지금 올려야 하는 버전", tags: ["React"] });
    expect(renderCoverHtml("pop", withTitle)).toContain('<div class="head">RSC 보안 패치</div>');
    const withHeadline = parseCoverSpec(JSON.stringify({ headline: "지금 올리세요" }), ctx);
    expect(renderCoverHtml("pop", withHeadline)).toContain('<div class="head">지금 올리세요</div>');
  });

  it("코드 속 HTML 특수문자를 이스케이프하고, 강조용 span 이 서로 깨지지 않는다", () => {
    const spec = parseCoverSpec(JSON.stringify({ ...full, code: '/* 주석 */\n<div class="a">768px</div>' }), ctx);
    const html = renderCoverHtml("code", spec);
    const pre = html.slice(html.indexOf("<pre"), html.indexOf("</pre>"));
    // 원문의 < > " 는 모두 이스케이프되고, 남은 태그는 강조용 span 뿐이다
    expect(pre).toContain("&#60;");
    expect(pre).toContain("&#34;a&#34;");
    expect(pre.replace(/<\/?span[^>]*>/g, "").replace(/^<pre[^>]*>/, "")).not.toMatch(/[<>]/);
  });

  it("모든 형식이 HTML 을 만든다", () => {
    const spec = parseCoverSpec(JSON.stringify(full), ctx);
    for (const style of COVER_STYLES) {
      expect(renderCoverHtml(style, spec)).toContain("<div class=\"c\">");
    }
  });
});
