import type { CoverSpec, CoverStyle } from "./cover-spec.js";
import { DEFAULT_ACCENT, LOGOS, logoDataUri } from "./logos.js";

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

/**
 * 아주 단순한 코드 강조 — 주석·문자열·숫자만 칠한다(커버용이라 정확한 문법 분석은 하지 않음).
 * 원문을 토큰으로 먼저 나눈 뒤 토큰마다 이스케이프한다. 이스케이프한 결과에 정규식을 다시 걸면
 * 앞서 넣은 <span style="…"> 속 숫자까지 칠해져 HTML 이 깨진다.
 */
const CODE_TOKEN = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|('[^'\n]*'|"[^"\n]*"|`[^`\n]*`)|(\b\d+(?:\.\d+)?(?:px|pt|rem|em|vh|vw|ms|s|%)?(?![\w]))/g;

function highlightCode(code: string, accent: string): string {
  let html = "";
  let last = 0;
  for (const match of code.matchAll(CODE_TOKEN)) {
    const [token, comment, string] = match;
    html += escapeHtml(code.slice(last, match.index));
    const color = comment ? MUTED : string ? "#b9d98a" : accent;
    html += `<span style="color:${color}">${escapeHtml(token)}</span>`;
    last = match.index! + token.length;
  }
  return html + escapeHtml(code.slice(last));
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

/** 코드형: macOS 창 모양 코드 블록이 화면을 채운다 */
function codeWindow(spec: CoverSpec): string {
  const accent = accentOf(spec);
  return page(
    `.c{background:radial-gradient(ellipse 70% 60% at 85% 0%,${accent}40,transparent 70%),radial-gradient(ellipse 60% 60% at 0% 100%,${accent}26,transparent 70%),${BG}}
     .win{position:absolute;left:140px;right:140px;top:150px;bottom:110px;border-radius:22px;background:#151514;
       border:1px solid rgba(255,255,255,.09);box-shadow:0 50px 120px rgba(0,0,0,.6),0 0 0 1px ${accent}22}
     .bar{height:64px;display:flex;align-items:center;gap:12px;padding:0 28px;border-bottom:1px solid rgba(255,255,255,.07)}
     .dot{width:16px;height:16px;border-radius:50%}
     .file{margin-left:18px;font-size:22px;color:${MUTED}}
     pre{margin:0;padding:48px 60px;font-size:42px;line-height:1.5;color:${INK};white-space:pre}
     .corner{left:auto;right:72px;top:56px;width:84px;height:84px}`,
    `${cornerLogo(spec)}<div class="win"><div class="bar">
       <span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span>
       <span class="file mono">${escapeHtml(spec.codeFile || spec.keyword)}</span></div>
       <pre class="mono">${highlightCode(spec.code, accent)}</pre></div>`
  );
}

/** 비교형: 이전(흐리게·취소선) → 이후(강조) */
function compare(spec: CoverSpec): string {
  const accent = accentOf(spec);
  return page(
    `.c{background:linear-gradient(90deg,#0b0b0a 0%,#0b0b0a 48%,${accent}22 100%),${BG}}
     .stack{position:absolute;left:200px;right:200px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:28px}
     .side{position:relative;font-size:74px;font-weight:700;line-height:1.2;padding:44px 56px 44px 220px;border-radius:24px;white-space:nowrap}
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
    case "logo-glow":
      return logoGlow(spec);
  }
}
