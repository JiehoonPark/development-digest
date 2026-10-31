import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * 커버에 쓸 수 있는 기술 로고. 파일은 `logos/` 에 원본 그대로 둔다(색·모양 변형 금지 — 상표 사용 원칙).
 * - Devicon(MIT) `*-original/plain.svg` — 원래 색 포함
 * - Simple Icons(CC0) `si-*.svg` — 단색이라 fill 을 지정해 쓴다
 * color 는 커버 빛 번짐·강조에 쓰는 대표색.
 */
export interface LogoInfo {
  file: string;
  color: string;
  /** 단색 아이콘의 채움색(어두운 배경용) */
  fill?: string;
}

const LIGHT = "#f4f2ee";

export const LOGOS: Record<string, LogoInfo> = {
  css: { file: "css3.svg", color: "#1572b6" },
  html: { file: "html5.svg", color: "#e44d26" },
  javascript: { file: "javascript.svg", color: "#e8c900" },
  typescript: { file: "typescript.svg", color: "#3178c6" },
  react: { file: "react.svg", color: "#149eca" },
  nextjs: { file: "nextjs.svg", color: "#8a8a8a" },
  vue: { file: "vuejs.svg", color: "#41b883" },
  nuxt: { file: "nuxtjs.svg", color: "#00dc82" },
  svelte: { file: "svelte.svg", color: "#ff3e00" },
  solid: { file: "solidjs.svg", color: "#446b9e" },
  angular: { file: "si-angular.svg", color: "#dd0031", fill: "#dd0031" },
  nodejs: { file: "nodejs.svg", color: "#5fa04e" },
  deno: { file: "deno.svg", color: "#70ffaf" },
  bun: { file: "bun.svg", color: "#fbf0df" },
  vite: { file: "vitejs.svg", color: "#9466ff" },
  webpack: { file: "webpack.svg", color: "#8dd6f9" },
  tailwind: { file: "tailwindcss.svg", color: "#38bdf8" },
  sass: { file: "sass.svg", color: "#cd6799" },
  astro: { file: "astro.svg", color: "#bc52ee" },
  storybook: { file: "storybook.svg", color: "#ff4785" },
  playwright: { file: "playwright.svg", color: "#2ead33" },
  vitest: { file: "vitest.svg", color: "#729b1b" },
  jest: { file: "jest.svg", color: "#c21325" },
  eslint: { file: "eslint.svg", color: "#4b32c3" },
  biome: { file: "si-biome.svg", color: "#60a5fa", fill: "#60a5fa" },
  redux: { file: "redux.svg", color: "#764abc" },
  graphql: { file: "graphql.svg", color: "#e10098" },
  chrome: { file: "chrome.svg", color: "#4285f4" },
  firefox: { file: "firefox.svg", color: "#ff7139" },
  safari: { file: "safari.svg", color: "#1b88ca" },
  github: { file: "github.svg", color: "#8a8a8a" },
  figma: { file: "figma.svg", color: "#a259ff" },
  vercel: { file: "si-vercel.svg", color: "#8a8a8a", fill: LIGHT },
  turborepo: { file: "si-turborepo.svg", color: "#ef4444", fill: LIGHT },
  cursor: { file: "si-cursor.svg", color: "#d97757", fill: LIGHT },
  anthropic: { file: "si-anthropic.svg", color: "#d97757", fill: LIGHT },
  openai: { file: "si-openai.svg", color: "#10a37f", fill: LIGHT },
};

export const LOGO_NAMES = Object.keys(LOGOS);

/** 로고가 없는 글의 기본 강조색 — 사이트 Primary(테라코타) */
export const DEFAULT_ACCENT = "#d97757";

const LOGO_DIR = join(dirname(fileURLToPath(import.meta.url)), "logos");

export function isKnownLogo(name: string): boolean {
  return Object.hasOwn(LOGOS, name);
}

/** `<img src>` 에 바로 넣는 data URI. 단색 아이콘은 fill 을 붙인다 */
export function logoDataUri(name: string): string {
  const info = LOGOS[name];
  let svg = readFileSync(join(LOGO_DIR, info.file), "utf8");
  if (info.fill) svg = svg.replace("<svg ", `<svg fill="${info.fill}" `);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
