/**
 * 커버 형식 미리보기 — AI·네트워크 비용 없이 각 형식을 렌더링해 data/preview/covers-gallery/ 에 저장한다.
 *   npx tsx scripts/preview-covers.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { parseCoverSpec, type CoverStyle } from "../src/post/cover/cover-spec.js";
import { renderHtmlToJpeg } from "../src/post/cover/render.js";
import { renderCoverHtml } from "../src/post/cover/templates.js";

const OUT = join(process.cwd(), "data/preview/covers-gallery");
mkdirSync(OUT, { recursive: true });

interface Sample {
  name: string;
  style: CoverStyle;
  title: string;
  tags: string[];
  spec: object;
}

const samples: Sample[] = [
  {
    name: "code-media-query",
    style: "code",
    title: "767.98px은 이제 그만",
    tags: ["CSS"],
    spec: {
      logos: ["css"],
      keyword: "범위 문법",
      codeFile: "breakpoints.css",
      code: "/* 이전 */\n@media (max-width: 767.98px) { … }\n\n/* 이후 */\n@media (width < 768px) { … }\n@media (768px <= width < 1024px) { … }",
    },
  },
  { name: "compare-media-query", style: "compare", title: "767.98px은 이제 그만", tags: ["CSS"], spec: { logos: ["css"], keyword: "범위 문법", before: "max-width: 767.98px", after: "width < 768px" } },
  { name: "stat-turbopack", style: "stat", title: "Turbopack 재빌드", tags: ["Next.js"], spec: { logos: ["nextjs"], keyword: "Turbopack", stat: "5.5×", statLabel: "더 빨라진 재빌드, 메모리는 90% 감소" } },
  { name: "logos-cursor", style: "logos", title: "Cursor Agent SDK", tags: ["AI 에이전트"], spec: { logos: ["cursor", "typescript"], keyword: "Agent SDK" } },
  { name: "typography-print", style: "typography", title: "인쇄용 CSS", tags: ["CSS"], spec: { logos: ["css"], keyword: "@media print", headline: "Ctrl+P를 눌러 보셨나요" } },
  { name: "glow-react", style: "logo-glow", title: "useEffectEvent", tags: ["React"], spec: { logos: ["react"], keyword: "useEffectEvent" } },
  // 팝아트 기본형 — 주제마다 다른 그림·색
  { name: "pop-security", style: "pop", title: "React Server Components 보안 패치 — 지금 올려야 하는 버전", tags: ["React", "보안"], spec: { logos: ["react"], keyword: "CVE-2025-55182" } },
  { name: "pop-ai", style: "pop", title: "코드 리뷰를 에이전트에게 맡기기 전에", tags: ["AI 에이전트"], spec: { logos: [], keyword: "AI 리뷰" } },
  { name: "pop-speed", style: "pop", title: "번들 크기 30% 줄이기 — import 하나씩 따져 보기", tags: ["성능"], spec: { logos: ["vite"], keyword: "tree shaking" } },
  { name: "pop-layout", style: "pop", title: "subgrid로 카드 높이 맞추기", tags: ["CSS", "레이아웃"], spec: { logos: ["css"], keyword: "subgrid" } },
  { name: "pop-browser", style: "pop", title: "View Transitions, 이제 모든 브라우저에서", tags: ["브라우저"], spec: { logos: [], keyword: "Baseline 2026" } },
  { name: "pop-burst", style: "pop", title: "프론트엔드 연례 설문 결과", tags: ["커뮤니티"], spec: { logos: [], keyword: "State of JS" } },
];

for (const sample of samples) {
  const spec = parseCoverSpec(JSON.stringify(sample.spec), { title: sample.title, tags: sample.tags });
  writeFileSync(join(OUT, `${sample.name}.jpg`), await renderHtmlToJpeg(renderCoverHtml(sample.style, spec)));
  console.log(`${sample.name}.jpg`);
}
