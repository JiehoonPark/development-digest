import type { CoverSpec } from "./cover-spec.js";

/**
 * 팝아트 커버에 그리는 주제별 장식. 글 주제를 한눈에 알 수 있게 오른쪽에 큰 그림 하나를 굵은 검정 선으로 그린다.
 * 작성 모델이 motif 를 고르지 않으면 보안 키워드 → 주인공 로고 → 제목·태그 키워드 → burst 순으로 정한다.
 */
export const MOTIFS = [
  "layout",
  "code",
  "component",
  "speed",
  "security",
  "ai",
  "test",
  "browser",
  "data",
  "burst",
] as const;
export type Motif = (typeof MOTIFS)[number];

export const MOTIF_DESCRIPTIONS: Record<Motif, string> = {
  layout: "CSS·레이아웃·반응형·디자인",
  code: "JS/TS 문법·타입·언어 기능",
  component: "프레임워크·컴포넌트·훅",
  speed: "성능·번들러·빌드 속도",
  security: "보안 패치·취약점",
  ai: "AI·에이전트·코딩 도구",
  test: "테스트·린트·품질",
  browser: "브라우저·웹 표준·Web API",
  data: "상태 관리·데이터 패칭·캐시",
  burst: "그 밖의 소식·발표",
};

const MOTIF_BY_LOGO: Record<string, Motif> = {
  css: "layout",
  html: "layout",
  tailwind: "layout",
  sass: "layout",
  figma: "layout",
  javascript: "code",
  typescript: "code",
  nodejs: "code",
  deno: "code",
  bun: "speed",
  github: "code",
  react: "component",
  nextjs: "component",
  vue: "component",
  nuxt: "component",
  svelte: "component",
  solid: "component",
  angular: "component",
  astro: "component",
  storybook: "component",
  vite: "speed",
  webpack: "speed",
  turborepo: "speed",
  vercel: "speed",
  playwright: "test",
  vitest: "test",
  jest: "test",
  eslint: "test",
  biome: "test",
  chrome: "browser",
  firefox: "browser",
  safari: "browser",
  graphql: "data",
  redux: "data",
  cursor: "ai",
  anthropic: "ai",
  openai: "ai",
};

/** 제목·태그·키워드에서 주제를 짐작하는 규칙(위에서부터 먼저 맞는 것) */
const MOTIF_BY_TEXT: Array<[Motif, RegExp]> = [
  ["ai", /(\bai\b|에이전트|agent|llm|\bgpt|claude|copilot|\bmcp\b|인공지능)/i],
  ["speed", /(성능|performance|속도|빨라|번들|bundle|최적화|web vitals|\blcp\b|\binp\b|turbopack)/i],
  ["test", /(테스트|\btest|e2e|\blint|품질)/i],
  ["layout", /(css|레이아웃|layout|반응형|responsive|grid|flex|@media|디자인)/i],
  ["browser", /(브라우저|browser|web api|baseline|표준|chrome|safari|firefox)/i],
  // "State of JS" 같은 고유명사에 걸리지 않게 "state" 단독은 보지 않는다
  ["data", /(상태 관리|state management|데이터 패칭|data fetching|캐시|\bcache\b|tanstack|react query|swr\b)/i],
  ["component", /(컴포넌트|component|\bhooks?\b|훅|렌더링|rendering)/i],
  ["code", /(타입|\btypes?\b|문법|syntax|javascript|typescript|함수)/i],
];

const SECURITY_PATTERN = /(보안|취약|security|\bcve\b|\bxss\b|csrf|인증|auth)/i;

function isMotif(value: string): value is Motif {
  return (MOTIFS as readonly string[]).includes(value);
}

export function resolveMotif(spec: CoverSpec): Motif {
  if (spec.motif && isMotif(spec.motif)) return spec.motif;

  const text = [spec.keyword, spec.headline, spec.title, ...spec.tags].join(" ");
  // 보안 소식은 어떤 기술이든 보안 그림이 먼저
  if (SECURITY_PATTERN.test(text)) return "security";

  const byLogo = spec.logos[0] ? MOTIF_BY_LOGO[spec.logos[0]] : undefined;
  if (byLogo) return byLogo;

  return MOTIF_BY_TEXT.find(([, pattern]) => pattern.test(text))?.[0] ?? "burst";
}

const INK = "#111111";
const STROKE = 12;

/**
 * 오른쪽 그림 영역(가로 1080~1560, 세로 200~800) 안에 그린다.
 * fill 은 강조색, paper 는 흰 면.
 */
export function motifSvg(motif: Motif, fill: string, paper: string): string {
  const s = `stroke="${INK}" stroke-width="${STROKE}" stroke-linejoin="round" stroke-linecap="round"`;
  const art = (() => {
    switch (motif) {
      case "layout":
        // 박스 모델 세 겹 + 아래 자
        return `
          <rect x="1110" y="250" width="400" height="400" rx="18" fill="${paper}" ${s}/>
          <rect x="1170" y="310" width="280" height="280" rx="14" fill="${fill}" ${s}/>
          <rect x="1240" y="380" width="140" height="140" rx="10" fill="${paper}" ${s}/>
          <rect x="1090" y="700" width="440" height="70" rx="12" fill="${paper}" ${s}/>
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<line x1="${1130 + i * 45}" y1="700" x2="${1130 + i * 45}" y2="${i % 2 ? 725 : 740}" ${s}/>`).join("")}`;
      case "code":
        // 큰 중괄호 한 쌍
        return `
          <text x="1320" y="640" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="800" font-size="430"
            fill="${paper}" ${s} paint-order="stroke fill" style="font-variant-ligatures:none">{ }</text>
          <rect x="1255" y="430" width="130" height="34" rx="17" fill="${fill}" ${s}/>`;
      case "component":
        // 부모 하나, 자식 둘인 컴포넌트 트리
        return `
          <line x1="1330" y1="420" x2="1190" y2="560" ${s}/><line x1="1330" y1="420" x2="1470" y2="560" ${s}/>
          <rect x="1210" y="250" width="240" height="170" rx="24" fill="${fill}" ${s}/>
          <rect x="1100" y="560" width="180" height="140" rx="22" fill="${paper}" ${s}/>
          <rect x="1380" y="560" width="180" height="140" rx="22" fill="${paper}" ${s}/>
          <text x="1330" y="358" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="800" font-size="72" fill="${INK}">&lt;/&gt;</text>`;
      case "speed":
        // 번개 + 속도선
        return `
          ${[300, 380, 460].map((y, i) => `<line x1="${1060 + i * 30}" y1="${y}" x2="${1200 + i * 30}" y2="${y}" ${s}/>`).join("")}
          <polygon points="1390,220 1210,500 1330,500 1260,780 1500,440 1370,440 1450,220" fill="${fill}" ${s}/>`;
      case "security":
        // 방패 + 자물쇠
        return `
          <path d="M1330 220 L1530 290 L1530 480 C1530 640 1430 740 1330 790 C1230 740 1130 640 1130 480 L1130 290 Z" fill="${fill}" ${s}/>
          <path d="M1270 470 L1270 420 C1270 380 1300 355 1330 355 C1360 355 1390 380 1390 420 L1390 470" fill="none" ${s}/>
          <rect x="1240" y="470" width="180" height="150" rx="18" fill="${paper}" ${s}/>
          <circle cx="1330" cy="535" r="18" fill="${INK}"/>`;
      case "ai": {
        // 반짝이(네 꼭짓점 별) 세 개
        const sparkle = (cx: number, cy: number, r: number, color: string) =>
          `<path d="M${cx} ${cy - r} C${cx + r * 0.12} ${cy - r * 0.12} ${cx + r * 0.12} ${cy - r * 0.12} ${cx + r} ${cy}
            C${cx + r * 0.12} ${cy + r * 0.12} ${cx + r * 0.12} ${cy + r * 0.12} ${cx} ${cy + r}
            C${cx - r * 0.12} ${cy + r * 0.12} ${cx - r * 0.12} ${cy + r * 0.12} ${cx - r} ${cy}
            C${cx - r * 0.12} ${cy - r * 0.12} ${cx - r * 0.12} ${cy - r * 0.12} ${cx} ${cy - r} Z" fill="${color}" ${s}/>`;
        return sparkle(1300, 510, 230, fill) + sparkle(1470, 290, 75, paper) + sparkle(1130, 720, 60, paper);
      }
      case "test":
        // 체크 표시 원 + 체크리스트
        return `
          <circle cx="1330" cy="430" r="190" fill="${fill}" ${s}/>
          <polyline points="1235,430 1305,500 1435,360" fill="none" stroke="${INK}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
          ${[0, 1].map((i) => `<rect x="${1150 + i * 200}" y="680" width="70" height="70" rx="12" fill="${paper}" ${s}/>
            <polyline points="${1165 + i * 200},715 ${1182 + i * 200},732 ${1208 + i * 200},698" fill="none" ${s}/>`).join("")}`;
      case "browser":
        // 브라우저 창 + 마우스 포인터
        return `
          <rect x="1090" y="240" width="460" height="400" rx="26" fill="${paper}" ${s}/>
          <path d="M1090 330 L1550 330" ${s}/>
          ${[0, 1, 2].map((i) => `<circle cx="${1135 + i * 42}" cy="285" r="14" fill="${i === 0 ? fill : INK}"/>`).join("")}
          <rect x="1140" y="380" width="250" height="34" rx="17" fill="${fill}" ${s}/>
          <rect x="1140" y="450" width="360" height="24" rx="12" fill="${INK}"/>
          <rect x="1140" y="500" width="300" height="24" rx="12" fill="${INK}"/>
          <path d="M1420 560 L1420 780 L1470 730 L1510 800 L1545 782 L1505 712 L1570 712 Z" fill="${paper}" ${s}/>`;
      case "data": {
        // 이어진 노드 그래프
        const nodes: Array<[number, number, number]> = [
          [1200, 300, 70],
          [1460, 330, 55],
          [1330, 520, 95],
          [1150, 690, 55],
          [1490, 700, 70],
        ];
        const edges = [
          [0, 2],
          [1, 2],
          [2, 3],
          [2, 4],
          [0, 1],
        ];
        return (
          edges.map(([a, b]) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" ${s}/>`).join("") +
          nodes.map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i === 2 ? fill : paper}" ${s}/>`).join("")
        );
      }
      case "burst": {
        // 만화 폭발 말풍선 + 느낌표
        const points = Array.from({ length: 24 }, (_, i) => {
          const angle = (Math.PI * 2 * i) / 24;
          const r = i % 2 ? 150 : 240;
          return `${(1300 + Math.cos(angle) * r).toFixed(0)},${(500 + Math.sin(angle) * r).toFixed(0)}`;
        }).join(" ");
        return `<polygon points="${points}" fill="${fill}" ${s}/>
          <text x="1300" y="600" text-anchor="middle" font-family="Anton, sans-serif" font-size="270" fill="${paper}" ${s} paint-order="stroke fill">!</text>`;
      }
    }
  })();
  return `<svg class="motif" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">${art}</svg>`;
}
