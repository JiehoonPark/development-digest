import { describe, it, expect } from "vitest";
import { calculateScore } from "../../src/prioritizer/scoring.js";
import type { CollectedItem } from "../../src/collectors/types.js";

function createItem(overrides: Partial<CollectedItem> = {}): CollectedItem {
  return {
    url: "https://example.com",
    title: "Test Article",
    sourceId: "geeknews",
    sourceName: "GeekNews",
    category: "community-domestic",
    language: "ko",
    publishedAt: new Date().toISOString(),
    contentType: "article",
    ...overrides,
  };
}

describe("calculateScore", () => {
  it("기본 점수를 계산한다", () => {
    const score = calculateScore(createItem());
    expect(score).toBeGreaterThan(0);
  });

  it("커뮤니티 소스에서 engagement 없으면 감점한다", () => {
    const withEngagement = calculateScore(
      createItem({ sourceId: "hackernews-top", category: "community-overseas", engagement: 100 })
    );
    const noEngagement = calculateScore(
      createItem({ sourceId: "velog-trending", category: "community-domestic" })
    );
    expect(withEngagement).toBeGreaterThan(noEngagement);
  });

  it("프론트엔드 키워드에 보너스를 부여한다", () => {
    const feItem = calculateScore(createItem({ title: "React 19 Server Components 성능 개선" }));
    const genericItem = calculateScore(createItem({ title: "Python 데이터 분석 가이드" }));
    expect(feItem).toBeGreaterThan(genericItem);
  });

  it("최신 콘텐츠에 높은 점수를 부여한다", () => {
    const recent = calculateScore(createItem({ publishedAt: new Date().toISOString() }));
    const old = calculateScore(
      createItem({
        publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      })
    );
    expect(recent).toBeGreaterThan(old);
  });

  it("engagement가 높으면 점수가 올라간다", () => {
    const popular = calculateScore(
      createItem({ sourceId: "hackernews-top", engagement: 300 })
    );
    const unpopular = calculateScore(
      createItem({ sourceId: "hackernews-top", engagement: 10 })
    );
    expect(popular).toBeGreaterThan(unpopular);
  });
});
