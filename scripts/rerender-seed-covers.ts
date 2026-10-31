/**
 * 시작 글 3편의 클레이 커버를 템플릿 커버로 다시 그린다(1회용).
 *   npx tsx scripts/rerender-seed-covers.ts
 * 세 편이 서로 다른 형식이 되도록 형식을 직접 지정한다.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { parseCoverSpec, type CoverStyle } from "../src/post/cover/cover-spec.js";
import { renderHtmlToJpeg } from "../src/post/cover/render.js";
import { renderCoverHtml } from "../src/post/cover/templates.js";

const ROOT = process.cwd();

const seeds: Array<{ slug: string; style: CoverStyle; alt: string; spec: object }> = [
  {
    slug: "2026-10-28-media-query-range",
    style: "compare",
    alt: "max-width: 767.98px 가 width < 768px 로 바뀌는 비교 카드와 CSS 로고",
    spec: { logos: ["css"], keyword: "범위 문법", before: "max-width: 767.98px", after: "width < 768px" },
  },
  {
    slug: "2026-10-29-cursor-agent-sdk",
    style: "logos",
    alt: "Cursor 로고와 TypeScript 로고, Agent SDK 문구",
    spec: { logos: ["cursor", "typescript"], keyword: "Agent SDK" },
  },
  {
    slug: "2026-10-27-printable-websites",
    style: "code",
    alt: "@media print 규칙이 적힌 코드 창",
    spec: {
      logos: ["css"],
      keyword: "@media print",
      codeFile: "print.css",
      // 본문에 실린 원문 설정 그대로(일부 발췌)
      code: "@media print {\n  .noPrint { display: none; }\n  p, ol  { font-size: 12pt; }\n  h1     { font-size: 16pt; }\n  a { color: black !important; }\n}",
    },
  },
];

for (const seed of seeds) {
  const html = renderCoverHtml(seed.style, parseCoverSpec(JSON.stringify(seed.spec), seed.slug));
  writeFileSync(join(ROOT, "web/public/covers", `${seed.slug}.jpg`), await renderHtmlToJpeg(html));

  const postPath = join(ROOT, "data/posts", `${seed.slug}.json`);
  const post = JSON.parse(readFileSync(postPath, "utf8"));
  post.cover = { src: `/covers/${seed.slug}.jpg`, alt: seed.alt, style: seed.style };
  writeFileSync(postPath, `${JSON.stringify(post, null, 2)}\n`);
  console.log(`${seed.slug} → ${seed.style}`);
}
