import "dotenv/config";
import { askClaude, parseJsonResponse } from "../src/summarizer/claude-summarizer.js";
import { FILTER_PROMPT } from "../config/prompts.js";

async function main() {
  const testInput = `[0] React 19.1 Released with New Compiler
    URL: https://react.dev/blog/react-19-1
    소스: React Blog | 점수: 90

[1] Next.js 15.3 brings Turbopack as default bundler
    URL: https://nextjs.org/blog/next-15-3
    소스: Next.js Blog | 점수: 88

[2] Understanding TypeScript 5.8 new features
    URL: https://devblogs.microsoft.com/typescript/typescript-5-8
    소스: TypeScript Blog | 점수: 80`;

  console.log("Claude API 테스트 시작...\n");

  const raw = await askClaude(FILTER_PROMPT, testInput);
  console.log("원본 응답:", raw);

  const parsed = parseJsonResponse<Array<{ index: number; category: string; relevance: number }>>(raw);
  console.log("\n파싱 결과:", JSON.stringify(parsed, null, 2));
}

main().catch(console.error);
