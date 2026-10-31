import { describe, expect, it } from "vitest";
import { chooseCoverStyle, parseCoverSpec, usableStyles } from "../../src/post/cover/cover-spec.js";
import { renderCoverHtml } from "../../src/post/cover/templates.js";

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
    const spec = parseCoverSpec(JSON.stringify({ logos: ["CSS", "css", "unknown-lib", "react", "vue", "svelte"] }), "x");
    expect(spec.logos).toEqual(["css", "react", "vue"]);
  });

  it("JSON 이 깨지면 빈 재료 + 대체 키워드", () => {
    const spec = parseCoverSpec("not json", "CSS");
    expect(spec.logos).toEqual([]);
    expect(spec.keyword).toBe("CSS");
  });

  it("너무 긴 키워드는 대체 키워드로", () => {
    expect(parseCoverSpec(JSON.stringify({ keyword: "x".repeat(60) }), "CSS").keyword).toBe("CSS");
  });
});

describe("usableStyles / chooseCoverStyle", () => {
  it("재료가 모두 있으면 다섯 형식 모두 후보", () => {
    expect(usableStyles(parseCoverSpec(JSON.stringify(full), "x"))).toEqual(["code", "compare", "stat", "logos", "typography"]);
  });

  it("너무 긴 코드·비교 문구는 후보에서 뺀다", () => {
    const spec = parseCoverSpec(JSON.stringify({ ...full, code: "a".repeat(80) + "\nb", before: "x".repeat(50) }), "x");
    expect(usableStyles(spec)).not.toContain("code");
    expect(usableStyles(spec)).not.toContain("compare");
  });

  it("최근 글에서 가장 오래 안 쓴 형식을 고른다", () => {
    const spec = parseCoverSpec(JSON.stringify(full), "x");
    expect(chooseCoverStyle(spec, [])).toBe("code");
    expect(chooseCoverStyle(spec, ["code"])).toBe("compare");
    expect(chooseCoverStyle(spec, ["compare", "code", "stat", "logos"])).toBe("typography");
    // 모두 썼으면 가장 오래전에 쓴 것
    expect(chooseCoverStyle(spec, ["typography", "compare", "code", "stat", "logos"])).toBe("logos");
  });

  it("맞는 재료가 없으면 로고+빛 기본형", () => {
    expect(chooseCoverStyle(parseCoverSpec(JSON.stringify({ logos: ["react"], keyword: "useEffectEvent" }), "x"), [])).toBe("logo-glow");
  });
});

describe("renderCoverHtml", () => {
  it("코드 속 HTML 특수문자를 이스케이프하고, 강조용 span 이 서로 깨지지 않는다", () => {
    const spec = parseCoverSpec(JSON.stringify({ ...full, code: '/* 주석 */\n<div class="a">768px</div>' }), "x");
    const html = renderCoverHtml("code", spec);
    const pre = html.slice(html.indexOf("<pre"), html.indexOf("</pre>"));
    // 원문의 < > " 는 모두 이스케이프되고, 남은 태그는 강조용 span 뿐이다
    expect(pre).toContain("&#60;div class=");
    expect(pre).toContain("&#34;a&#34;");
    expect(pre.replace(/<\/?span[^>]*>/g, "").replace(/^<pre[^>]*>/, "")).not.toMatch(/[<>]/);
  });

  it("모든 형식이 HTML 을 만든다", () => {
    const spec = parseCoverSpec(JSON.stringify(full), "x");
    for (const style of ["code", "compare", "stat", "logos", "typography", "logo-glow"] as const) {
      expect(renderCoverHtml(style, spec)).toContain("<div class=\"c\">");
    }
  });
});
