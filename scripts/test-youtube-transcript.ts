// 영상 자막 추출 스모크 테스트 — 429 부분 실패 시에도 받아둔 SRT 를 살리는지 확인.
// 사용: npx tsx scripts/test-youtube-transcript.ts [영상URL...]
import { extractYoutubeTranscript } from "../src/extractors/youtube-transcript.js";

async function main() {
  const urls = process.argv.slice(2).length
    ? process.argv.slice(2)
    : [
        "https://www.youtube.com/watch?v=8GRmLR__OGQ",
        "https://www.youtube.com/watch?v=x-hI_k2JFRc",
        "https://www.youtube.com/watch?v=A8mokin_YOs",
      ];

  // enricher 의 pMap(concurrency 3) 과 동일하게 동시 호출 — 내부 직렬화 큐 검증
  const results = await Promise.all(urls.map((u) => extractYoutubeTranscript(u)));

  let failed = 0;
  for (const r of results) {
    console.log(`${r.url} → ${r.status} ${r.content.length}자`);
    if (r.status !== "success" || r.content.length < 500) failed++;
  }

  if (failed > 0) {
    console.error(`${failed}/${results.length} 건 자막 확보 실패`);
    process.exit(1);
  }
  console.log("OK — 전체 영상 자막 확보");
}

main();
