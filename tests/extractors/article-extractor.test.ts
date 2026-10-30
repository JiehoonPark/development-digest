import { afterEach, describe, expect, it, vi } from "vitest";
import { extractArticle, isNoiseClass } from "../../src/extractors/article-extractor.js";

const PARAGRAPH = "범위 문법은 비교 연산자로 구간을 씁니다. 경계값을 계산하지 않아도 됩니다. ".repeat(6);

function htmlPage(articleClass: string): string {
  return `<html><head>
<title>문서 제목</title>
<meta property="og:image" content="/og.png">
</head><body>
<nav class="site-nav"><a href="https://twitter.com/x">메뉴</a></nav>
<article>
  <div class="${articleClass}">
    <p>${PARAGRAPH}</p>
    <p>자세한 내용은 <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media">MDN</a>과
    <a href="/docs/app">문서</a>를 보세요. <a href="#top">위로</a></p>
  </div>
  <div class="share-buttons">공유하기 공유하기 공유하기</div>
</article>
</body></html>`;
}

function mockFetch(html: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      const res = new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
      Object.defineProperty(res, "url", { value: "https://blog.example.com/post" });
      return res;
    })
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("isNoiseClass", () => {
  it("영역 이름 클래스는 노이즈", () => {
    expect(isNoiseClass("share-buttons")).toBe(true);
    expect(isNoiseClass("post-sidebar wide")).toBe(true);
    expect(isNoiseClass("ad-slot")).toBe(true);
  });

  it("Tailwind 임의값 유틸리티 안의 단어는 무시한다", () => {
    expect(isNoiseClass("w-full max-w-(--article-max-width) [&_.comment]:pt-0 [&>h2:first-child]:!pt-0")).toBe(false);
  });
});

describe("extractArticle", () => {
  it("Tailwind 임의값 클래스가 붙은 본문 컨테이너를 지우지 않는다 (nextjs.org 회귀)", async () => {
    mockFetch(htmlPage("w-full [&_.comment]:text-gray-900 [&>pre]:w-full"));
    const result = await extractArticle("https://blog.example.com/post");

    expect(result.status).toBe("success");
    expect(result.content).toContain("범위 문법은");
    expect(result.content).not.toContain("공유하기");
  });

  it("제목·대표 이미지·본문 링크를 절대 URL 로 돌려준다", async () => {
    mockFetch(htmlPage("prose"));
    const result = await extractArticle("https://blog.example.com/post");

    expect(result.title).toBe("문서 제목");
    expect(result.image).toBe("https://blog.example.com/og.png");
    // 내비게이션 링크와 자기 자신(#top)은 빼고, 같은 사이트 문서 링크는 남긴다
    expect(result.links).toEqual([
      "https://developer.mozilla.org/en-US/docs/Web/CSS/@media",
      "https://blog.example.com/docs/app",
    ]);
  });
});
