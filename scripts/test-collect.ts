import "dotenv/config";
import { createCollector } from "../src/collectors/index.js";
import { allSources } from "../config/sources/index.js";

async function main() {
  // 각 타입별 1개씩 테스트
  const testSources = [
    allSources.find((s) => s.type === "rss"),
    allSources.find((s) => s.type === "hackernews"),
    allSources.find((s) => s.type === "reddit"),
    allSources.find((s) => s.type === "youtube"),
    allSources.find((s) => s.type === "github-trending"),
  ].filter(Boolean);

  for (const source of testSources) {
    if (!source) continue;

    console.log(`\n--- ${source.name} (${source.type}) ---`);
    const collector = createCollector(source);
    const result = await collector.collect();

    if (result.error) {
      console.log(`❌ 에러: ${result.error}`);
    } else {
      console.log(`✅ ${result.items.length}개 수집`);
      for (const item of result.items.slice(0, 3)) {
        console.log(`  • ${item.title}`);
        console.log(`    ${item.url}`);
      }
    }
  }
}

main().catch(console.error);
