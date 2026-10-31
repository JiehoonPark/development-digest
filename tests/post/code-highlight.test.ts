import { describe, expect, it } from "vitest";
import { BRACKET_COLORS, highlightCode, languageOf, SYNTAX_COLORS } from "../../src/post/cover/code-highlight.js";

/** span 을 걷어 낸 HTML 을 원문으로 되돌린다 */
const textOf = (html: string) =>
  html.replace(/<span[^>]*>|<\/span>/g, "").replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

/** 토큰이 어떤 색으로 칠해졌는지 */
const colorOf = (html: string, token: string) => {
  const escaped = token.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  return html.match(new RegExp(`<span style="color:([^;"]+)[^"]*">${escaped.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</span>`))?.[1];
};

describe("languageOf", () => {
  it("확장자로 정하고, 없으면 주인공 로고로 짐작한다", () => {
    expect(languageOf("print.css")).toBe("css");
    expect(languageOf("ChatRoom.tsx")).toBe("script");
    expect(languageOf("index.html")).toBe("markup");
    expect(languageOf("@media print", "css")).toBe("css");
    expect(languageOf("useEffectEvent", "react")).toBe("script");
    expect(languageOf("메모")).toBe("plain");
  });
});

describe("highlightCode", () => {
  const css = "@media print {\n  .noPrint { display: none; }\n  h1 { font-size: 16pt; }\n  a { color: black !important; }\n}";
  const ts = "const onConnected = useEffectEvent(() => {\n  showNotification('연결됨', theme);\n}, [roomId]);";

  it("원문 글자를 바꾸지 않는다", () => {
    expect(textOf(highlightCode(css, "css"))).toBe(css);
    expect(textOf(highlightCode(ts, "script"))).toBe(ts);
    const markup = '<a href="/x">링크 & 설명</a>';
    expect(textOf(highlightCode(markup, "markup"))).toBe(markup);
  });

  it("원문의 HTML 특수문자는 모두 이스케이프한다", () => {
    const html = highlightCode('<div class="a">', "markup");
    expect(html.replace(/<\/?span[^>]*>/g, "")).not.toMatch(/[<>"]/);
  });

  it("괄호는 깊이마다 다른 색, 짝은 같은 색", () => {
    const html = highlightCode("a({[x]})", "script");
    const brackets = [...html.matchAll(/<span style="color:([^"]+)">([(){}[\]])<\/span>/g)].map(([, color, char]) => `${char}${color}`);
    expect(brackets).toEqual([
      `(${BRACKET_COLORS[0]}`,
      `{${BRACKET_COLORS[1]}`,
      `[${BRACKET_COLORS[2]}`,
      `]${BRACKET_COLORS[2]}`,
      `}${BRACKET_COLORS[1]}`,
      `)${BRACKET_COLORS[0]}`,
    ]);
  });

  it("넷째 깊이에서 첫 색으로 돌아간다", () => {
    const html = highlightCode("((((", "plain");
    expect([...html.matchAll(/color:([^"]+)/g)].map(([, color]) => color)).toEqual([...BRACKET_COLORS, BRACKET_COLORS[0]]);
  });

  it("CSS: at-rule·선택자·속성·값·숫자를 구분한다", () => {
    const html = highlightCode(css, "css");
    expect(colorOf(html, "@media")).toBe(SYNTAX_COLORS.keyword);
    expect(colorOf(html, ".noPrint")).toBe(SYNTAX_COLORS.selector);
    expect(colorOf(html, "display")).toBe(SYNTAX_COLORS.property);
    expect(colorOf(html, "none")).toBe(SYNTAX_COLORS.value);
    expect(colorOf(html, "16pt")).toBe(SYNTAX_COLORS.number);
    expect(colorOf(html, "h1")).toBe(SYNTAX_COLORS.tag);
    expect(colorOf(html, "!important")).toBe(SYNTAX_COLORS.keyword);
    // at-rule 뒤의 미디어 유형은 요소 선택자가 아니다
    expect(colorOf(html, "print")).toBeUndefined();
  });

  it("CSS: 범위 문법의 비교 연산자와 단위", () => {
    const html = highlightCode("@media (768px <= width < 1024px) { … }", "css");
    expect(colorOf(html, "768px")).toBe(SYNTAX_COLORS.number);
    expect(colorOf(html, "<=")).toBe(SYNTAX_COLORS.operator);
  });

  it("스크립트: 키워드·함수·문자열·타입", () => {
    const html = highlightCode(`${ts}\ntype Route = { path: string };\nconst ok = true;`, "script");
    expect(colorOf(html, "const")).toBe(SYNTAX_COLORS.keyword);
    expect(colorOf(html, "useEffectEvent")).toBe(SYNTAX_COLORS.function);
    expect(colorOf(html, "'연결됨'")).toBe(SYNTAX_COLORS.string);
    expect(colorOf(html, "Route")).toBe(SYNTAX_COLORS.type);
    expect(colorOf(html, "true")).toBe(SYNTAX_COLORS.constant);
    expect(colorOf(html, "=>")).toBe(SYNTAX_COLORS.operator);
  });

  it("스크립트: 점 뒤 이름은 키워드여도 속성", () => {
    const html = highlightCode("node.type = mod.default;", "script");
    expect(colorOf(html, "type")).toBe(SYNTAX_COLORS.property);
    expect(colorOf(html, "default")).toBe(SYNTAX_COLORS.property);
  });

  it("주석 속 괄호·키워드는 칠하지 않는다", () => {
    const html = highlightCode("// const (a)\nx", "script");
    expect(colorOf(html, "// const (a)")).toBe(SYNTAX_COLORS.comment);
  });
});
