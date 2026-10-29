import { describe, it, expect } from "vitest";
import { splitByFreshness, MAX_ITEM_AGE_DAYS } from "../../src/dedup/freshness.js";
import type { CollectedItem } from "../../src/collectors/types.js";

function item(url: string, publishedAt: string): CollectedItem {
  return {
    url,
    title: url,
    sourceId: "react-blog",
    sourceName: "React Blog",
    category: "framework-blog",
    language: "en",
    publishedAt,
    contentType: "article",
  };
}

const NOW = new Date("2026-10-29T08:00:00+09:00");

describe("splitByFreshness", () => {
  it("RSS 에 남아 있는 10개월 전 글(2025-12 React 보안 공지)은 제외한다", () => {
    const old = item("https://react.dev/blog/2025/12/03/critical", "2025-12-03T00:00:00.000Z");
    const { fresh, stale } = splitByFreshness([old], NOW);
    expect(fresh).toEqual([]);
    expect(stale).toEqual([old]);
  });

  it("기준일 이내 글은 유지한다", () => {
    const recent = item("https://a.dev/recent", "2026-10-28T00:00:00.000Z");
    const weekend = item("https://a.dev/weekend", "2026-10-24T00:00:00.000Z");
    expect(splitByFreshness([recent, weekend], NOW).fresh).toEqual([recent, weekend]);
  });

  it(`정확히 ${MAX_ITEM_AGE_DAYS}일 경계는 포함, 넘으면 제외한다`, () => {
    const boundary = new Date(NOW.getTime() - MAX_ITEM_AGE_DAYS * 24 * 3600 * 1000);
    const justOver = new Date(boundary.getTime() - 60 * 1000);
    const a = item("https://a.dev/boundary", boundary.toISOString());
    const b = item("https://a.dev/over", justOver.toISOString());
    const { fresh, stale } = splitByFreshness([a, b], NOW);
    expect(fresh).toEqual([a]);
    expect(stale).toEqual([b]);
  });

  it("날짜를 해석할 수 없으면 오래됐다고 단정하지 않는다", () => {
    const unknown = item("https://a.dev/unknown", "not-a-date");
    expect(splitByFreshness([unknown], NOW).fresh).toEqual([unknown]);
  });
});
