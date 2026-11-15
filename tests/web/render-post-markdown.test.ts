import { describe, expect, it } from "vitest";
import { renderPostMarkdown } from "../../web/src/shared/lib/render-post-markdown.js";

describe("renderPostMarkdown 강조 블록", () => {
  it("PITFALL 은 증상 제목과 확인할 곳 문단으로 나뉘고, 인용 번호도 링크가 된다", () => {
    const html = renderPostMarkdown("> [!PITFALL] 캐시가 맞았는데 `dist`가 없다\n> `outputs`를 확인합니다.[4]");
    expect(html).toContain('<aside class="callout-pitfall"');
    expect(html).toContain("<strong>캐시가 맞았는데 <code>dist</code>가 없다</strong>");
    expect(html).toContain('href="#source-4"');
  });

  it("RULE 은 번호 목록, STAT 은 값과 설명, QUOTE 는 figcaption 으로 출처를 단다", () => {
    const rule = renderPostMarkdown("> [!RULE] 경계 규칙\n> - 아래는 포함\n> - 위는 제외");
    expect(rule).toMatch(/<aside class="callout-rule"[^>]*>.*<ol><li>아래는 포함<\/li><li>위는 제외<\/li><\/ol>/s);

    const stat = renderPostMarkdown("> [!STAT]\n> 50% | 떨어진 프레임[3]\n> 1% | transform");
    expect(stat).toContain('<strong class="stat-value">50%</strong><span class="stat-caption">떨어진 프레임');
    expect(stat.match(/class="stat-item"/g)).toHaveLength(2);

    const quote = renderPostMarkdown("> [!QUOTE] Dan Abramov\n> MPA처럼 생각하지만 SPA처럼 느껴진다.");
    expect(quote).toContain("<figcaption>Dan Abramov</figcaption>");
  });

  it("표시 없는 인용은 그대로 blockquote 로 둔다", () => {
    expect(renderPostMarkdown("> 그냥 인용")).toContain("<blockquote>");
  });
});
