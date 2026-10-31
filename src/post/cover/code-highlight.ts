/**
 * 커버 코드 창용 문법 강조 + 괄호 색(bracket pair colorization). 색은 VS Code 테마 One Dark Pro 를 따른다.
 *
 * 커버에 실리는 코드는 2~9줄짜리 발췌라 문법 분석기(shiki 등)까지는 쓰지 않고,
 * 언어별 토큰 규칙을 위에서부터 차례로 맞춰 보는 작은 스캐너로 칠한다.
 * 원문을 토큰으로 나눈 뒤 토큰마다 이스케이프한다 — 이스케이프한 HTML 에 다시 정규식을 걸면 span 속 값까지 칠해져 깨진다.
 */

export type CodeLanguage = "css" | "script" | "markup" | "plain";

/**
 * One Dark Pro(Binaryify/OneDark-Pro, themes/OneDark-Pro.json)의 편집기 색.
 * 토큰 색은 각 토큰 종류에 해당하는 TextMate scope 를 테마에서 찾은 값이다(주석에 scope).
 */
export const ONE_DARK_PRO = {
  background: "#282c34", // editor.background
  titleBar: "#21252b", // editorGroupHeader.tabsBackground
  foreground: "#abb2bf", // editor.foreground
  tabForeground: "#dcdcdc", // tab.activeForeground
  border: "#181a1f",
} as const;

export const SYNTAX_COLORS = {
  comment: "#7f848e", // comment (italic)
  keyword: "#c678dd", // keyword, storage, keyword.control.at-rule, keyword.other.important
  string: "#98c379", // string
  number: "#d19a66", // constant.numeric
  unit: "#e06c75", // keyword.other.unit (12pt 의 pt)
  constant: "#d19a66", // constant.language (true, null)
  function: "#61afef", // entity.name.function
  cssFunction: "#56b6c2", // support.function (var, calc)
  type: "#e5c07b", // entity.name.type, support.type.primitive, support.class
  variable: "#e06c75", // variable.other.readwrite, variable.parameter
  object: "#e5c07b", // variable.other.object (점 앞)
  property: "#e06c75", // variable.other.property, meta.object-literal.key
  cssProperty: "#abb2bf", // support.type.property-name
  value: "#d19a66", // support.constant.property-value.css, 색 이름·16진 색
  classSelector: "#d19a66", // entity.other.attribute-name.class.css
  idSelector: "#61afef", // entity.other.attribute-name.id
  pseudo: "#56b6c2", // entity.other.attribute-name.pseudo-class
  tag: "#e06c75", // entity.name.tag
  attribute: "#d19a66", // entity.other.attribute-name
  operator: "#56b6c2", // keyword.operator.assignment·comparison·logical
  punctuation: "#abb2bf", // 테마에 지정 없음 → editor.foreground
} as const;

type TokenKind = keyof typeof SYNTAX_COLORS | "plain";

/** editorBracketHighlight.foreground1~3 — 깊이마다 돌려 쓴다 */
export const BRACKET_COLORS = ["#d19a66", "#c678dd", "#56b6c2"] as const;

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
};

/** CSS 숫자는 값과 단위를 따로 칠한다(One Dark Pro: 12 는 주황, pt 는 빨강) */
const CSS_NUMBER = /(-?(?:\d+\.?\d*|\.\d+))([a-z]+|%)?(?![\w-])/;

const CSS_RULES: Rule[] = [
  COMMON_RULES.blockComment,
  COMMON_RULES.string,
  rule("keyword", /@[\w-]+|!important\b/),
  // 값 위치의 색 코드(#fff)를 선택자(#id)보다 먼저 — 16진 글자만으로 된 경우만
  rule("value", /#[0-9a-fA-F]{3,8}(?![\w-])/),
  rule("classSelector", /\.[A-Za-z_][\w-]*/),
  rule("idSelector", /#[A-Za-z_][\w-]*/),
  rule("pseudo", /::?[a-z][\w-]*(?![\w-]*\s*:\s)/),
  // "속성: 값" — 콜론 뒤 공백까지 있어야 속성(a:hover 같은 가상 클래스와 구분)
  rule("cssProperty", /[\w-]+(?=\s*:\s)/),
  // 요소 선택자(p, h1, a) — 뒤에 { 가 오고, @media print 처럼 at-rule 뒤가 아닐 때
  rule("tag", /(?<!@[\w-]+[^{};]*)[a-z][a-z0-9]*(?=[^;{}()]*\{)/),
  rule("number", CSS_NUMBER),
  rule("cssFunction", /[\w-]+(?=\()/),
  // 이름은 통째로 — 값 위치면 값 색, 아니면 그대로
  rule("plain", /[A-Za-z_][\w-]*/),
  rule("operator", /<=|>=|[<>=]/),
  rule("punctuation", /[;:,.+*\/~]/),
];

const SCRIPT_KEYWORDS =
  /(?<![.\w$])(?:const|let|var|function|return|if|else|for|while|do|import|export|from|default|async|await|new|class|extends|implements|type|interface|enum|as|satisfies|of|in|typeof|keyof|instanceof|throw|try|catch|finally|switch|case|break|continue|yield|delete|void|readonly|public|private|protected|static)(?![\w$])/;

const SCRIPT_RULES: Rule[] = [
  COMMON_RULES.blockComment,
  COMMON_RULES.lineComment,
  COMMON_RULES.string,
  rule("keyword", SCRIPT_KEYWORDS),
  rule("constant", /(?<![.\w$])(?:true|false|null|undefined|NaN|Infinity)(?![\w$])/),
  rule("object", /(?<![.\w$])this(?![\w$])/),
  rule("type", /(?<![.\w$])(?:string|number|boolean|bigint|symbol|object|unknown|any|never)(?![\w$])/),
  // JSX 태그 — 소문자는 HTML 태그(빨강), 대문자는 컴포넌트(노랑)
  rule("tag", /(?<=<\/?)[a-z][\w.-]*(?=[\s>\/])/),
  rule("type", /(?<=<\/?)[A-Z][\w.]*(?=[\s>\/])/),
  rule("function", /[A-Za-z_$][\w$]*(?=\s*(?:<[^>()]*>)?\()/),
  rule("property", /(?<=\.)[A-Za-z_$][\w$]*/),
  rule("object", /[A-Za-z_$][\w$]*(?=\??\.(?!\.))/),
  rule("type", /[A-Z][\w$]*/),
  // 객체 키(타입 표기 auth?: 포함)
  rule("property", /[A-Za-z_$][\w$]*(?=\??\s*:(?!:))/),
  rule("number", /(?<![\w$])(?:0x[\da-fA-F]+|\d[\d_]*\.?\d*(?:e[+-]?\d+)?n?)(?![\w$])/),
  rule("variable", /[A-Za-z_$][\w$]*/),
  rule("keyword", /=>/),
  rule("operator", /===|!==|==|!=|<=|>=|&&=?|\|\|=?|\?\?=?|[+\-*\/%]=|=|!|[<>+\-*\/%]/),
  rule("punctuation", /\?\.|\.\.\.|[;:,.?]/),
];

const MARKUP_RULES: Rule[] = [
  rule("comment", /<!--[\s\S]*?-->/),
  rule("punctuation", /<\/?|\/?>/),
  rule("tag", /(?<=<\/?)[A-Za-z][\w:-]*/),
  COMMON_RULES.string,
  rule("attribute", /[A-Za-z_:@][\w:.-]*(?==)/),
  rule("punctuation", /=/),
];

const PLAIN_RULES: Rule[] = [
  COMMON_RULES.blockComment,
  COMMON_RULES.lineComment,
  COMMON_RULES.string,
  rule("number", /(?<![\w$])\d+(?:\.\d+)?(?![\w$])/),
];

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

/** 토큰 하나를 HTML 로. CSS 숫자는 값·단위로 나눈다 */
function renderToken(kind: TokenKind, text: string, language: CodeLanguage, inCssValue: boolean): string {
  if (kind === "plain") return inCssValue ? colored(text, SYNTAX_COLORS.value) : escapeHtml(text);
  if (kind === "comment") return colored(text, SYNTAX_COLORS.comment, true);
  if (kind === "number" && language === "css") {
    const [, digits = text, unit = ""] = text.match(CSS_NUMBER) ?? [];
    return colored(digits, SYNTAX_COLORS.number) + (unit ? colored(unit, SYNTAX_COLORS.unit) : "");
  }
  return colored(text, SYNTAX_COLORS[kind]);
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
      if (kind === "cssProperty") afterCssProperty = true;
      if (kind === "punctuation" && text === ":" && afterCssProperty) {
        inCssValue = true;
        afterCssProperty = false;
      } else if (kind === "punctuation" && text === ";") {
        inCssValue = false;
      }
    }

    html += renderToken(kind, text, language, inCssValue);
    index += text.length;
  }

  flushPlain();
  return html;
}
