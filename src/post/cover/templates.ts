import type { CoverSpec, CoverStyle } from "./cover-spec.js";
import { highlightCode, languageOf, ONE_DARK_PRO } from "./code-highlight.js";
import { DEFAULT_ACCENT, LOGOS, logoDataUri } from "./logos.js";
import { motifSvg, resolveMotif, type Motif } from "./motifs.js";

/**
 * 커버 형식별 HTML. 1600×900(16:9)으로 캡처한다.
 * 공통 규칙: 사이트 배경과 이어지는 거의 검정 바탕, 글자는 Pretendard·JetBrains Mono, 강조색은 글의 주인공 로고 색.
 */
export const COVER_WIDTH = 1600;
export const COVER_HEIGHT = 900;

const BG = "#0b0b0a";
const INK = "#f4f2ee";
const MUTED = "rgba(244,242,238,.55)";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function accentOf(spec: CoverSpec): string {
  return spec.logos[0] ? LOGOS[spec.logos[0]].color : DEFAULT_ACCENT;
}

function logoImg(name: string, className = "logo"): string {
  return `<img class="${className}" src="${logoDataUri(name)}" alt="">`;
}

/** 좌상단 작은 로고 배지(주인공 로고가 있을 때) */
function cornerLogo(spec: CoverSpec): string {
  return spec.logos[0] ? `<div class="corner">${logoImg(spec.logos[0], "corner-logo")}</div>` : "";
}

const BASE_CSS = `
html,body{margin:0;width:${COVER_WIDTH}px;height:${COVER_HEIGHT}px;overflow:hidden;background:${BG}}
*{box-sizing:border-box}
.c{position:relative;width:100%;height:100%;overflow:hidden;background:${BG};color:${INK};
  font-family:'Pretendard Variable',Pretendard,-apple-system,sans-serif;word-break:keep-all}
/* 합자를 끈다 — <= 가 ≤ 로 바뀌면 실제 코드와 다르게 보인다 */
.mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-variant-ligatures:none;font-feature-settings:"liga" 0,"calt" 0}
.grid{position:absolute;inset:0;
  background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);
  background-size:64px 64px;-webkit-mask-image:radial-gradient(ellipse 60% 70% at 50% 55%,#000 30%,transparent 80%)}
.corner{position:absolute;left:72px;top:64px;width:72px;height:72px}
.corner-logo{width:100%;height:100%;object-fit:contain}
`;

function page(css: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700;800&display=swap">
<style>${BASE_CSS}${css}</style></head><body><div class="c">${body}</div></body></html>`;
}

/** 기본형: 어두운 바탕 + 아래에서 번지는 빛 + 중앙 로고 + 키워드 */
function logoGlow(spec: CoverSpec): string {
  const accent = accentOf(spec);
  // 로고가 없으면 키워드 자체를 크게 — 이니셜 같은 가짜 로고는 만들지 않는다
  const hasLogo = Boolean(spec.logos[0]);
  const center = hasLogo ? logoImg(spec.logos[0]) : `<div class="word mono">${escapeHtml(spec.keyword)}</div>`;
  return page(
    `.c{background:radial-gradient(ellipse 85% 95% at 50% 108%,${accent} 0%,${accent}dd 22%,${accent}66 48%,${accent}14 70%,transparent 85%),${BG}}
     .label{position:absolute;left:0;right:0;top:118px;text-align:center;font-weight:800;font-size:60px;letter-spacing:.04em}
     .logo,.mark{position:absolute;left:50%;top:250px;transform:translateX(-50%);width:380px;height:380px;object-fit:contain;
       filter:drop-shadow(0 30px 60px rgba(0,0,0,.55)) drop-shadow(0 0 90px ${accent}88)}
     .word{position:absolute;left:80px;right:80px;top:50%;transform:translateY(-62%);text-align:center;
       font-size:${spec.keyword.length > 14 ? 120 : 170}px;font-weight:800;letter-spacing:-.02em;line-height:1.05;color:${INK};
       text-shadow:0 0 90px ${accent}88}`,
    `<div class="grid"></div>${hasLogo ? `<div class="label mono">${escapeHtml(spec.keyword)}</div>` : ""}${center}`
  );
}

/** 코드 창 안쪽 크기(창 1320×640 − 제목 줄 64 − 위아래·좌우 여백) */
const CODE_AREA = { width: 1200, height: 470 } as const;
const CODE_LINE_HEIGHT = 1.5;
/** JetBrains Mono 한 글자 폭 ≈ 0.6em */
const MONO_CHAR_WIDTH = 0.6;
const CODE_FONT = { max: 42, min: 26 } as const;

/** 고정폭 글꼴에서 차지하는 칸 수(한글은 두 칸) */
function monoColumns(text: string): number {
  return [...text].reduce((sum, char) => sum + (/[\u3131-\uD79D]/.test(char) ? 2 : 1), 0);
}

/** 줄 수와 가장 긴 줄에 맞춰 글자 크기를 줄인다 — 창 밖으로 넘치지 않게 */
function codeFontSize(code: string): number {
  const lines = code.split("\n");
  const widest = Math.max(...lines.map(monoColumns));
  const byHeight = CODE_AREA.height / (lines.length * CODE_LINE_HEIGHT);
  const byWidth = CODE_AREA.width / (widest * MONO_CHAR_WIDTH);
  return Math.max(CODE_FONT.min, Math.min(CODE_FONT.max, Math.floor(Math.min(byHeight, byWidth))));
}

/** 코드형: macOS 창 모양 코드 블록이 화면을 채운다. 문법 색 + 괄호 깊이별 색 */
function codeWindow(spec: CoverSpec): string {
  const accent = accentOf(spec);
  return page(
    `.c{background:radial-gradient(ellipse 70% 60% at 85% 0%,${accent}40,transparent 70%),radial-gradient(ellipse 60% 60% at 0% 100%,${accent}26,transparent 70%),${BG}}
     /* 창은 VS Code One Dark Pro 편집기 색 — 제목 줄 #21252b, 본문 #282c34 */
     .win{position:absolute;left:140px;right:140px;top:150px;bottom:110px;border-radius:22px;overflow:hidden;background:${ONE_DARK_PRO.background};
       border:1px solid ${ONE_DARK_PRO.border};box-shadow:0 50px 120px rgba(0,0,0,.6),0 0 0 1px ${accent}22}
     .bar{height:64px;display:flex;align-items:center;gap:12px;padding:0 28px;background:${ONE_DARK_PRO.titleBar};border-bottom:1px solid ${ONE_DARK_PRO.border}}
     .dot{width:16px;height:16px;border-radius:50%}
     .file{margin-left:18px;font-size:22px;color:${ONE_DARK_PRO.tabForeground}}
     pre{margin:0;padding:48px 60px;font-size:${codeFontSize(spec.code)}px;line-height:${CODE_LINE_HEIGHT};color:${ONE_DARK_PRO.foreground};white-space:pre}
     .corner{left:auto;right:72px;top:56px;width:84px;height:84px}`,
    `${cornerLogo(spec)}<div class="win"><div class="bar">
       <span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span>
       <span class="file mono">${escapeHtml(spec.codeFile || spec.keyword)}</span></div>
       <pre class="mono">${highlightCode(spec.code, languageOf(spec.codeFile, spec.logos[0]))}</pre></div>`
  );
}

/** 비교형: 이전(흐리게·취소선) → 이후(강조) */
/** 비교 카드 글자 영역 폭(카드 1360 − 왼쪽 라벨 자리 220 − 오른쪽 여백 56) */
const COMPARE_TEXT_WIDTH = 1084;
const COMPARE_FONT = { max: 74, min: 40 } as const;

/** 전/후 중 긴 쪽에 맞춰 글자를 줄인다 — 34자까지 카드 밖으로 넘치지 않게(한글은 두 칸) */
function compareFontSize(spec: CoverSpec): number {
  const widest = Math.max(...[spec.before, spec.after].map(monoColumns));
  const fit = Math.floor(COMPARE_TEXT_WIDTH / (widest * MONO_CHAR_WIDTH));
  return Math.max(COMPARE_FONT.min, Math.min(COMPARE_FONT.max, fit));
}

function compare(spec: CoverSpec): string {
  const accent = accentOf(spec);
  return page(
    `.c{background:linear-gradient(90deg,#0b0b0a 0%,#0b0b0a 48%,${accent}22 100%),${BG}}
     .stack{position:absolute;left:120px;right:120px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:28px}
     .side{position:relative;font-size:${compareFontSize(spec)}px;font-weight:700;line-height:1.2;padding:44px 56px 44px 220px;border-radius:24px;white-space:nowrap}
     .side .tag{position:absolute;left:56px;top:50%;transform:translateY(-50%);font-size:26px;letter-spacing:.18em;text-decoration:none}
     .before{color:${MUTED};text-decoration:line-through;text-decoration-thickness:4px;text-decoration-color:rgba(244,242,238,.35);background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07)}
     .after{color:${INK};background:${accent}1f;border:2px solid ${accent}}
     .before .tag{color:${MUTED}}.after .tag{color:${accent}}
     .corner{left:auto;right:72px}`,
    `${cornerLogo(spec)}<div class="stack">
       <div class="side before mono"><span class="tag">BEFORE</span>${escapeHtml(spec.before)}</div>
       <div class="side after mono"><span class="tag">AFTER</span>${escapeHtml(spec.after)}</div></div>`
  );
}

/** 수치형: 큰 숫자 하나 */
function stat(spec: CoverSpec): string {
  const accent = accentOf(spec);
  return page(
    `.c{background:radial-gradient(circle at 78% 50%,${accent}55 0%,${accent}18 35%,transparent 60%),${BG}}
     .num{position:absolute;left:110px;top:170px;font-size:340px;font-weight:800;line-height:.9;letter-spacing:-.04em;
       background:linear-gradient(180deg,${INK} 20%,${accent});-webkit-background-clip:text;color:transparent}
     .lbl{position:absolute;left:120px;bottom:150px;right:520px;font-size:56px;font-weight:700;line-height:1.3}
     .big{position:absolute;right:120px;top:50%;transform:translateY(-50%);width:300px;height:300px;object-fit:contain;opacity:.95}`,
    `<div class="num">${escapeHtml(spec.stat)}</div><div class="lbl">${escapeHtml(spec.statLabel)}</div>
     ${spec.logos[0] ? logoImg(spec.logos[0], "big") : ""}`
  );
}

/** 로고 조합형: 기술 2~3개가 함께 나오는 글 */
function logos(spec: CoverSpec): string {
  const accent = accentOf(spec);
  const second = LOGOS[spec.logos[1]].color;
  const tiles = spec.logos.map((name) => `<div class="tile">${logoImg(name)}</div>`).join(`<div class="plus">+</div>`);
  return page(
    `.c{background:radial-gradient(ellipse 50% 70% at 20% 100%,${accent}66,transparent 70%),radial-gradient(ellipse 50% 70% at 80% 100%,${second}66,transparent 70%),${BG}}
     .row{position:absolute;left:0;right:0;top:230px;display:flex;justify-content:center;align-items:center;gap:44px}
     .tile{width:300px;height:300px;border-radius:44px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);display:grid;place-items:center;
       box-shadow:0 40px 90px rgba(0,0,0,.5)}
     .tile .logo{width:190px;height:190px;object-fit:contain}
     .plus{font-size:80px;color:${MUTED};font-weight:300}
     .label{position:absolute;left:0;right:0;bottom:120px;text-align:center;font-size:52px;font-weight:800}`,
    `<div class="grid"></div><div class="row">${tiles}</div><div class="label mono">${escapeHtml(spec.keyword)}</div>`
  );
}

/** 타이포형: 포스터 인용과 같은 결의 큰 글자 */
function typography(spec: CoverSpec): string {
  const accent = accentOf(spec);
  return page(
    `.c{background:${BG}}
     .bar{position:absolute;left:0;top:0;bottom:0;width:22px;background:${accent}}
     .kw{position:absolute;left:120px;top:150px;font-size:34px;color:${accent};letter-spacing:.04em}
     .head{position:absolute;left:112px;right:300px;top:230px;font-family:'Anton','Black Han Sans','Pretendard Variable',sans-serif;
       font-size:${spec.headline.length > 14 ? 150 : 190}px;line-height:1.04;color:${INK}}
     .corner{left:auto;right:96px;top:auto;bottom:90px;width:120px;height:120px}`,
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Black+Han+Sans&display=swap">
     <div class="bar"></div><div class="kw mono">${escapeHtml(spec.keyword)}</div><div class="head">${escapeHtml(spec.headline)}</div>${cornerLogo(spec)}`
  );
}

/** 팝아트 배경·강조색 — 주제마다 다른 조합. 글자는 흰 면 + 굵은 검정 테두리 + 검정 그림자라 어느 배경에서도 읽힌다 */
const POP_PALETTES: Record<Motif, { bg: string; fill: string }> = {
  layout: { bg: "#2f6bff", fill: "#ffd60a" },
  code: { bg: "#ffd60a", fill: "#ff4d6d" },
  component: { bg: "#3fd0ff", fill: "#ff4d6d" },
  speed: { bg: "#ff6a1f", fill: "#ffd60a" },
  security: { bg: "#ff3b3b", fill: "#ffd60a" },
  ai: { bg: "#a77bff", fill: "#ffd60a" },
  test: { bg: "#22d58b", fill: "#ffd60a" },
  browser: { bg: "#ffd60a", fill: "#2f6bff" },
  data: { bg: "#ff7ac6", fill: "#3fd0ff" },
  burst: { bg: "#ffd60a", fill: "#ff3b3b" },
};
const POP_PAPER = "#fffaf0";
const POP_INK = "#111111";

/** 제목의 "— 부제" 앞부분을 큰 글자로. 모델이 준 headline 이 있으면 그것을 쓴다 */
function popHeadline(spec: CoverSpec): string {
  if (spec.headline) return spec.headline;
  const [main] = spec.title.split(/\s+[—–-]\s+/);
  return (main || spec.keyword).trim();
}

/** 글자 수가 많을수록 작게 — 최대 세 줄 안에 들어가게 */
function popFontSize(headline: string): number {
  const length = [...headline].length;
  if (length <= 8) return 190;
  if (length <= 14) return 150;
  if (length <= 22) return 118;
  return 96;
}

/** 기본형: 팝아트 큰 글자 + 망점 + 주제 그림 */
function pop(spec: CoverSpec): string {
  const motif = resolveMotif(spec);
  const { bg, fill } = POP_PALETTES[motif];
  const headline = popHeadline(spec);
  const keywordChip = spec.keyword && spec.keyword !== headline ? `<div class="chip mono">${escapeHtml(spec.keyword)}</div>` : "";
  const sticker = spec.logos[0] ? `<div class="sticker">${logoImg(spec.logos[0], "sticker-logo")}</div>` : "";
  return page(
    `.c{background:${bg}}
     /* 망점 — 오른쪽 위에서 왼쪽 아래로 옅어진다 */
     .dots{position:absolute;inset:0;background-image:radial-gradient(${POP_INK}33 26%,transparent 28%);background-size:30px 30px;
       -webkit-mask-image:linear-gradient(225deg,#000 0%,rgba(0,0,0,.55) 35%,transparent 70%)}
     /* 오른쪽 그림 뒤 햇살 줄무늬 */
     .rays{position:absolute;left:1330px;top:500px;width:2400px;height:2400px;transform:translate(-50%,-50%);border-radius:50%;
       background:repeating-conic-gradient(${POP_PAPER}26 0deg 9deg,transparent 9deg 18deg);
       -webkit-mask-image:radial-gradient(circle,#000 0%,#000 22%,transparent 40%)}
     .motif{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(14px 14px 0 ${POP_INK})}
     .chip{position:absolute;left:96px;top:110px;padding:14px 26px;background:${POP_INK};color:${POP_PAPER};
       font-size:34px;font-weight:800;border-radius:10px;transform:rotate(-2deg);box-shadow:8px 8px 0 ${fill}}
     .head{position:absolute;left:92px;width:960px;top:${keywordChip ? 230 : 170}px;
       font-family:'Anton','Black Han Sans','Pretendard Variable',sans-serif;font-size:${popFontSize(headline)}px;line-height:1.08;
       color:${POP_PAPER};-webkit-text-stroke:10px ${POP_INK};paint-order:stroke fill;text-shadow:12px 12px 0 ${POP_INK};
       display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;padding:0 24px 24px 0}
     /* 로고 스티커는 왼쪽 아래 빈자리 — 오른쪽 주제 그림과 겹치지 않게 */
     .sticker{position:absolute;left:96px;bottom:84px;width:140px;height:140px;border-radius:28px;background:${POP_PAPER};
       border:8px solid ${POP_INK};box-shadow:10px 10px 0 ${POP_INK};display:grid;place-items:center;transform:rotate(-6deg)}
     .sticker-logo{width:96px;height:96px;object-fit:contain}
     .frame{position:absolute;inset:26px;border:8px solid ${POP_INK};border-radius:22px;pointer-events:none}`,
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Black+Han+Sans&display=swap">
     <div class="dots"></div><div class="rays"></div>${motifSvg(motif, fill, POP_PAPER)}
     ${keywordChip}<div class="head">${escapeHtml(headline)}</div>${sticker}<div class="frame"></div>`
  );
}

export function renderCoverHtml(style: CoverStyle, spec: CoverSpec): string {
  switch (style) {
    case "code":
      return codeWindow(spec);
    case "compare":
      return compare(spec);
    case "stat":
      return stat(spec);
    case "logos":
      return logos(spec);
    case "typography":
      return typography(spec);
    case "pop":
      return pop(spec);
    case "logo-glow":
      return logoGlow(spec);
  }
}
