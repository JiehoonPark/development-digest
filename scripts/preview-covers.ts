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

const samples: Array<[string, CoverStyle, object]> = [
  [
    "code-media-query",
    "code",
    {
      logos: ["css"],
      keyword: "범위 문법",
      codeFile: "breakpoints.css",
      code: "/* 이전 */\n@media (max-width: 767.98px) { … }\n\n/* 이후 */\n@media (width < 768px) { … }\n@media (768px <= width < 1024px) { … }",
    },
  ],
  ["compare-media-query", "compare", { logos: ["css"], keyword: "범위 문법", before: "max-width: 767.98px", after: "width < 768px" }],
  ["stat-turbopack", "stat", { logos: ["nextjs"], keyword: "Turbopack", stat: "5.5×", statLabel: "더 빨라진 재빌드, 메모리는 90% 감소" }],
  ["logos-cursor", "logos", { logos: ["cursor", "typescript"], keyword: "Agent SDK" }],
  ["typography-print", "typography", { logos: ["css"], keyword: "@media print", headline: "Ctrl+P를 눌러 보셨나요" }],
  ["glow-react", "logo-glow", { logos: ["react"], keyword: "useEffectEvent" }],
  ["glow-nologo", "logo-glow", { logos: [], keyword: "Web Vitals" }],
];

for (const [name, style, spec] of samples) {
  const image = await renderHtmlToJpeg(renderCoverHtml(style, parseCoverSpec(JSON.stringify(spec), name)));
  writeFileSync(join(OUT, `${name}.jpg`), image);
  console.log(`${name}.jpg`);
}
