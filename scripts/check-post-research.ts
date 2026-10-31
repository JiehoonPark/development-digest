/**
 * AI 호출 없이 실제 네트워크로 확인하는 점검 스크립트.
 *   npx tsx scripts/check-post-research.ts <원문 URL> [MDN 검색어...]
 * 1) 원문 추출·링크 수집·MDN 검색이 실제로 되는지
 * 2) 기존 data/posts 글이 형식 검사를 통과하는지
 */
import { gatherResearch } from "../src/post/research.js";
import { lintPost } from "../src/post/post-lint.js";
import { loadPosts } from "../src/post/post-store.js";

const [url, ...mdnQueries] = process.argv.slice(2);

if (url) {
  const sources = await gatherResearch(
    { url, title: url, sourceName: new URL(url).hostname, contentType: "article", labels: [], relevance: 0 },
    mdnQueries
  );
  for (const source of sources) {
    console.log(`[${source.id}] ${source.publisher} · ${source.title.slice(0, 70)}\n    ${source.url}\n    본문 ${source.content.length}자`);
  }
}

console.log("\n기존 글 형식 검사");
for (const post of loadPosts()) {
  const issues = lintPost({
    title: post.title,
    dek: post.dek,
    tldr: post.tldr,
    body: post.body,
    actions: post.actions ?? [],
    sourceIds: post.sources.map((source) => source.id),
  });
  console.log(`- ${post.slug}: ${issues.length === 0 ? "통과" : issues.map((issue) => `${issue.severity}:${issue.rule}`).join(", ")}`);
}
