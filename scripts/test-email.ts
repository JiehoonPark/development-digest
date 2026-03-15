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
            keyPoints: [
              "새로운 React Compiler가 기본 포함 — 수동 useMemo/useCallback 최적화가 불필요해짐",
              "번들 크기 30% 감소, 초기 렌더링 속도 약 2배 향상",
              "Server Components와 Actions의 안정화로 프로덕션 사용 권장",
            ],
            whyItMatters: "React 앱의 성능 최적화 방식이 근본적으로 바뀌므로, 기존 최적화 패턴 재검토가 필요합니다.",
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
            keyPoints: [
              "Turbopack이 Webpack을 대체하여 기본 번들러로 설정",
              "개발 서버 cold start 70% 단축, HMR 10배 빠름",
              "Webpack 설정은 호환 레이어를 통해 계속 사용 가능",
            ],
            whyItMatters: "Next.js 프로젝트의 개발 경험이 대폭 개선되며, 기존 Webpack 커스텀 설정 마이그레이션 계획이 필요합니다.",
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
            keyPoints: [
              "React Compiler 벤치마크: 실제 프로덕션 앱에서 리렌더링 40% 감소",
              "use() 훅의 실전 활용법과 Suspense 통합 데모",
            ],
            whyItMatters: "React 19.1 업그레이드 전에 실제 성능 수치와 마이그레이션 주의사항을 빠르게 파악할 수 있습니다.",
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
