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

  it("월요일: 56시간 전 콘텐츠도 최신성 점수를 받는다", () => {
    // 월요일 오전 8시
    const monday = new Date("2026-03-16T08:00:00+09:00"); // 월요일
    const saturdayContent = new Date(monday.getTime() - 56 * 60 * 60 * 1000);

    const mondayScore = calculateScore(
      createItem({ publishedAt: saturdayContent.toISOString() }),
      monday
    );
    // 같은 콘텐츠를 화요일에 평가하면 0점
    const tuesday = new Date("2026-03-17T08:00:00+09:00");
    const tuesdayScore = calculateScore(
      createItem({ publishedAt: saturdayContent.toISOString() }),
      tuesday
    );
    expect(mondayScore).toBeGreaterThan(tuesdayScore);
  });

  it("월요일: 32시간 전 일요일 콘텐츠가 높은 최신성 점수를 받는다", () => {
    const monday = new Date("2026-03-16T08:00:00+09:00");
    const sundayContent = new Date(monday.getTime() - 32 * 60 * 60 * 1000);

    const score = calculateScore(
      createItem({ publishedAt: sundayContent.toISOString() }),
      monday
    );
    // 32시간 < 36시간(12+24), 15점 이상 받아야 함
    // 기본 소스 점수 + 최신성 15점 이상
    expect(score).toBeGreaterThan(30);
  });
});
