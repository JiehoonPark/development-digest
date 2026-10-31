/**
 * 커버 코드 창용 문법 강조 + 괄호 색(bracket pair colorization).
 *
 * 커버에 실리는 코드는 2~8줄짜리 발췌라 문법 분석기(shiki 등)까지는 쓰지 않고,
 * 언어별 토큰 규칙을 위에서부터 차례로 맞춰 보는 작은 스캐너로 칠한다.
 * 원문을 토큰으로 나눈 뒤 토큰마다 이스케이프한다 — 이스케이프한 HTML 에 다시 정규식을 걸면 span 속 값까지 칠해져 깨진다.
 */

export type CodeLanguage = "css" | "script" | "markup" | "plain";

type TokenKind =
  | "comment"
  | "string"
  | "keyword"
  | "constant"
  | "number"
  | "selector"
  | "property"
  | "value"
  | "function"
  | "type"
  | "tag"
  | "operator"
  | "punctuation"
  | "plain";

/** 어두운 코드 창(#151514) 위 색. 사이트 강조색(테라코타)과 부딪히지 않는 Material 계열 */
export const SYNTAX_COLORS: Record<Exclude<TokenKind, "plain">, string> = {
  comment: "rgba(244,242,238,.42)",
  string: "#c3e88d",
  keyword: "#c792ea",
  constant: "#f78c6c",
  number: "#f78c6c",
  selector: "#ffcb6b",
  property: "#89ddff",
  value: "#c3e88d",
  function: "#82aaff",
  type: "#ffcb6b",
  tag: "#f07178",
  operator: "#89ddff",
  punctuation: "rgba(244,242,238,.6)",
};

/** VS Code 기본 괄호 색 세 가지를 깊이마다 돌려 쓴다 */
export const BRACKET_COLORS = ["#ffd700", "#da70d6", "#179fff"] as const;

const OPEN_BRACKETS = "({[";
const CLOSE_BRACKETS = ")}]";

const EXTENSION_LANGUAGES: Record<string, CodeLanguage> = {
  css: "css",
  scss: "css",
  sass: "css",
  less: "css",
  js: "script",
  jsx: "script",
  mjs: "script",
  cjs: "script",
  ts: "script",
  tsx: "script",
  mts: "script",
  json: "script",
  vue: "script",
  svelte: "script",
  astro: "script",
  html: "markup",
  xml: "markup",
  svg: "markup",
};

const LOGO_LANGUAGES: Record<string, CodeLanguage> = {
  css: "css",
  tailwind: "css",
  sass: "css",
  html: "markup",
};

/** 파일 확장자로 언어를 정하고, 확장자가 없으면 주인공 로고로 짐작한다(JS 계열이 가장 흔해 기본은 script) */
export function languageOf(fileName: string, logo?: string): CodeLanguage {
  const extension = fileName.match(/\.([a-z]+)$/i)?.[1]?.toLowerCase();
  if (extension && EXTENSION_LANGUAGES[extension]) return EXTENSION_LANGUAGES[extension];
  if (logo && LOGO_LANGUAGES[logo]) return LOGO_LANGUAGES[logo];
  return logo ? "script" : "plain";
}

interface Rule {
  kind: TokenKind;
  pattern: RegExp;
}

/** 모든 규칙은 sticky(y) — 현재 위치에서만 맞춰 본다 */
const rule = (kind: TokenKind, source: RegExp): Rule => ({ kind, pattern: new RegExp(source.source, "y") });

const COMMON_RULES = {
  blockComment: rule("comment", /\/\*[\s\S]*?\*\//),
  lineComment: rule("comment", /\/\/[^\n]*/),
  string: rule("string", /'[^'\n]*'|"[^"\n]*"|`[^`]*`/),
  number: rule("number", /-?(?:\d+\.?\d*|\.\d+)(?:px|pt|rem|em|vh|vw|dvh|svh|ch|fr|ms|s|deg|x|n)?%?(?![\w$])/),
  punctuation: rule("punctuation", /[;:,.]/),
};

const CSS_RULES: Rule[] = [
  COMMON_RULES.blockComment,
  COMMON_RULES.string,
  rule("keyword", /@[\w-]+|!important\b/),
  // 값 위치의 색 코드(#fff)를 선택자(#id)보다 먼저 — 16진 글자만으로 된 경우만
  rule("number", /#[0-9a-fA-F]{3,8}(?![\w-])/),
  rule("selector", /[.#][A-Za-z_][\w-]*|::?[a-z][\w-]*/),
  // "속성: 값" — 콜론 뒤 공백까지 있어야 속성(a:hover 같은 가상 클래스와 구분)
  rule("property", /[\w-]+(?=\s*:\s)/),
  // 요소 선택자(p, h1, a) — 뒤에 { 가 오고, @media print 처럼 at-rule 뒤가 아닐 때
  rule("tag", /(?<!@[\w-]+[^{};]*)[a-z][a-z0-9]*(?=[^;{}()]*\{)/),
  COMMON_RULES.number,
  rule("function", /[\w-]+(?=\()/),
  // 이름은 통째로 — 값 위치면 값 색, 아니면 그대로
  rule("plain", /[A-Za-z_][\w-]*/),
  rule("operator", /<=|>=|[<>=+*\/~]/),
  COMMON_RULES.punctuation,
];

const SCRIPT_KEYWORDS =
  /(?:const|let|var|function|return|if|else|for|while|do|import|export|from|default|async|await|new|class|extends|implements|type|interface|enum|as|satisfies|of|in|typeof|keyof|instanceof|throw|try|catch|finally|switch|case|break|continue|yield|delete|void)(?![\w$])/;

const SCRIPT_RULES: Rule[] = [
  COMMON_RULES.blockComment,
  COMMON_RULES.lineComment,
  COMMON_RULES.string,
  // 점 뒤의 이름은 키워드여도 속성(obj.default, node.type)
  rule("property", /(?<=\.)[A-Za-z_$][\w$]*/),
  rule("keyword", SCRIPT_KEYWORDS),
  rule("constant", /(?:true|false|null|undefined|this)(?![\w$])/),
  // JSX 태그 이름(<div, </Button)
  rule("tag", /(?<=<\/?)[A-Za-z][\w.]*/),
  rule("function", /[A-Za-z_$][\w$]*(?=\s*(?:<[^>()]*>)?\()/),
  rule("type", /[A-Z][\w$]*/),
  // 객체 키
  rule("property", /[A-Za-z_$][\w$]*(?=\s*:(?!:))/),
  COMMON_RULES.number,
  rule("plain", /[A-Za-z_$][\w$]*/),
  rule("operator", /=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?=?|\?\.|\.\.\.|[=+\-*\/%!<>?&|]/),
  COMMON_RULES.punctuation,
];

const MARKUP_RULES: Rule[] = [
  rule("comment", /<!--[\s\S]*?-->/),
  rule("tag", /<\/?[A-Za-z][\w:-]*|\/?>/),
  COMMON_RULES.string,
  rule("property", /[A-Za-z_:@][\w:.-]*(?==)/),
  rule("operator", /=/),
];

const PLAIN_RULES: Rule[] = [COMMON_RULES.blockComment, COMMON_RULES.lineComment, COMMON_RULES.string, COMMON_RULES.number];

const RULES_BY_LANGUAGE: Record<CodeLanguage, Rule[]> = {
  css: CSS_RULES,
  script: SCRIPT_RULES,
  markup: MARKUP_RULES,
  plain: PLAIN_RULES,
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function colored(text: string, color: string, italic = false): string {
  const style = italic ? `color:${color};font-style:italic` : `color:${color}`;
  return `<span style="${style}">${escapeHtml(text)}</span>`;
}

export function highlightCode(code: string, language: CodeLanguage): string {
  const rules = RULES_BY_LANGUAGE[language];
  let html = "";
  let plainRun = "";
  let depth = 0;
  // CSS 값(속성 콜론 뒤 ~ ; 또는 중괄호) 안의 이름(none, black, auto)은 값 색으로 칠한다
  let afterCssProperty = false;
  let inCssValue = false;

  const flushPlain = () => {
    html += escapeHtml(plainRun);
    plainRun = "";
  };

  let index = 0;
  while (index < code.length) {
    const char = code[index];

    if (OPEN_BRACKETS.includes(char) || CLOSE_BRACKETS.includes(char)) {
      flushPlain();
      const isOpen = OPEN_BRACKETS.includes(char);
      if (!isOpen) depth = Math.max(0, depth - 1);
      html += colored(char, BRACKET_COLORS[depth % BRACKET_COLORS.length]);
      if (isOpen) depth += 1;
      if (language === "css" && (char === "{" || char === "}")) inCssValue = false;
      index += 1;
      continue;
    }

    const matched = rules
      .map(({ kind, pattern }) => {
        pattern.lastIndex = index;
        const text = pattern.exec(code)?.[0];
        return text ? { kind, text } : undefined;
      })
      .find(Boolean);

    if (!matched) {
      // 공백·규칙에 없는 글자는 모아 한 번에 낸다
      plainRun += char;
      index += 1;
      continue;
    }

    flushPlain();
    const { kind, text } = matched;

    if (language === "css") {
      if (kind === "property") afterCssProperty = true;
      if (kind === "punctuation" && text === ":" && afterCssProperty) {
        inCssValue = true;
        afterCssProperty = false;
      } else if (kind === "punctuation" && text === ";") {
        inCssValue = false;
      }
    }

    if (kind === "plain") {
      html += inCssValue ? colored(text, SYNTAX_COLORS.value) : escapeHtml(text);
    } else {
      html += colored(text, SYNTAX_COLORS[kind], kind === "comment");
    }
    index += text.length;
  }

  flushPlain();
  return html;
}
