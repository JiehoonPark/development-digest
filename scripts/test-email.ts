import "dotenv/config";
import { sendTestEmail } from "../src/email/email-sender.js";
import { composeNewsletter } from "../src/composer/newsletter-composer.js";
import type { DigestResult } from "../src/summarizer/batch-processor.js";

async function main() {
  const to = process.argv[2] ?? process.env.DIGEST_RECIPIENTS?.split(",")[0];
  if (!to) {
    console.error("사용법: npx tsx scripts/test-email.ts your@email.com");
    process.exit(1);
  }

  const mockDigest: DigestResult = {
    intro:
      "오늘은 React 19.1 출시와 함께 Next.js 15.3의 Turbopack 기본 번들러 전환 소식이 화제입니다. TypeScript 5.8의 새로운 기능도 주목할 만합니다.",
    sections: [
      {
        category: "hot",
        items: [
          {
            title: "React 19.1 Released with New Compiler",
            url: "https://react.dev/blog",
            sourceName: "React Blog",
            summary:
              "React 19.1이 출시되었습니다. 새로운 컴파일러가 포함되어 번들 크기가 30% 감소하고, 렌더링 성능이 크게 개선되었습니다.",
            engagement: 523,
            contentType: "article",
          },
        ],
      },
      {
        category: "tech",
        items: [
          {
            title: "Next.js 15.3 — Turbopack이 기본 번들러로",
            url: "https://nextjs.org/blog",
            sourceName: "Next.js Blog",
            summary:
              "Next.js 15.3에서 Turbopack이 기본 번들러로 채택되었습니다. 개발 서버 시작 시간이 70% 단축되고, HMR 속도가 10배 빨라졌습니다.",
            engagement: 312,
            contentType: "article",
          },
        ],
      },
      {
        category: "video",
        items: [
          {
            title: "What's new in React 19.1? (Theo)",
            url: "https://youtube.com/watch?v=test",
            sourceName: "Theo (t3.gg)",
            summary:
              "Theo가 React 19.1의 핵심 변경사항을 20분 만에 정리합니다. 특히 새 컴파일러의 실제 벤치마크 결과가 인상적입니다.",
            contentType: "video",
          },
        ],
      },
    ],
  };

  const html = composeNewsletter(mockDigest);
  console.log(`테스트 이메일 발송 중... → ${to}`);
  await sendTestEmail(html, to);
  console.log("✅ 발송 완료!");
}

main().catch(console.error);
