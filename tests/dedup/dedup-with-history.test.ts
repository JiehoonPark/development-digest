import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CollectedItem } from "../../src/collectors/types.js";

// DB 를 열지 않도록 SQLite 저장소를 대체한다. 이력은 비어 있다고 가정 = CI 캐시 유실 상황.
const seenUrls = new Set<string>();
vi.mock("../../src/db/repositories/seen-urls.js", () => ({
  isUrlSeen: (url: string) => seenUrls.has(url),
  markUrlsBatch: vi.fn(),
}));
vi.mock("../../src/db/repositories/recent-titles.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/db/repositories/recent-titles.js")>();
  return { ...actual, getRecentTitleKeys: () => new Set<string>(), markTitlesRecent: vi.fn() };
});

const { dedup } = await import("../../src/dedup/dedup-service.js");
const { normalizeTitleKey } = await import("../../src/db/repositories/recent-titles.js");

function item(url: string, title: string): CollectedItem {
  return {
    url,
    title,
    sourceId: "react-blog",
    sourceName: "React Blog",
    category: "framework-blog",
    language: "en",
    publishedAt: "2026-10-28T00:00:00.000Z",
    contentType: "article",
  };
}

const RSC_URL = "https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components";
const RSC_TITLE = "Critical Security Vulnerability in React Server Components";

beforeEach(() => seenUrls.clear());

describe("dedup + 이전 발행본 이력", () => {
  it("DB 이력이 비어 있어도 이전 호에 실린 URL 은 다시 싣지 않는다", () => {
    const history = { urls: new Set([RSC_URL]), titleKeys: new Set<string>(), archiveCount: 1 };
    const result = dedup([item(`${RSC_URL}/?utm_source=hn`, RSC_TITLE), item("https://a.dev/new", "New")], history);
    expect(result.map((r) => r.url)).toEqual(["https://a.dev/new"]);
  });

  it("다른 출처(HN 등)에 같은 제목으로 올라온 스토리도 제외한다", () => {
    const history = { urls: new Set<string>(), titleKeys: new Set([normalizeTitleKey(RSC_TITLE)]), archiveCount: 1 };
    const result = dedup([item("https://news.ycombinator.com/item?id=1", `${RSC_TITLE}!`)], history);
    expect(result).toEqual([]);
  });

  it("이력을 넘기지 않으면 기존 동작(같은 실행 내 URL 중복 제거)을 유지한다", () => {
    const result = dedup([item("https://a.dev/x", "X"), item("https://a.dev/x/", "X again")]);
    expect(result.map((r) => r.title)).toEqual(["X"]);
  });
});
