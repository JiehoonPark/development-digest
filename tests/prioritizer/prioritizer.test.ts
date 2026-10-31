import { afterEach, describe, expect, it, vi } from "vitest";
import { parseDigestPreferences } from "../../config/preferences.js";
import type { CollectedItem } from "../../src/collectors/types.js";
import { prioritize } from "../../src/prioritizer/prioritizer.js";

function article(id: string, overrides: Partial<CollectedItem> = {}): CollectedItem {
  return {
    url: `https://example.com/${id}`,
    title: "Web development",
    sourceId: id,
    sourceName: id,
    category: "framework-blog",
    language: "en",
    publishedAt: "2026-01-01T00:00:00Z",
    contentType: "article",
    ...overrides,
  };
}

afterEach(() => vi.useRealTimers());

describe("개인화 우선순위", () => {
  it("기본 설정이면 소스 상한 없이 점수순 50건", () => {
    const items = Array.from({ length: 60 }, (_, i) => article(`a${i}`, { sourceId: "same" }));
    expect(prioritize(items, parseDigestPreferences({}))).toHaveLength(50);
  });

  it("제외 키워드와 제외 소스는 AI 분류 전에 뺀다", () => {
    const preferences = parseDigestPreferences({ excludedKeywords: ["crypto"], excludedSourceIds: ["blocked"] });
    const items = prioritize(
      [
        article("clean"),
        article("tagged", { tags: ["CRYPTO"] }),
        article("blocked"),
        article("summary", { summary: "Crypto analysis" }),
      ],
      preferences
    );
    expect(items.map((item) => item.sourceId)).toEqual(["clean"]);
  });

  it("소스 상한을 넘으면 다음 소스의 기사로 채운다", () => {
    const preferences = parseDigestPreferences({ maxCandidates: 3, maxPerSource: 1 });
    const input = [article("a1", { sourceId: "a" }), article("a2", { sourceId: "a" }), article("b"), article("c")];
    expect(prioritize(input, preferences).map((item) => item.sourceId)).toEqual(["a", "b", "c"]);
  });

  it("영문 키워드는 단어 경계로, 한국어는 조사가 붙어도 맞춘다", () => {
    const preferences = parseDigestPreferences({ preferredKeywords: ["React", "C++", "접근성"] });
    const items = prioritize(
      [article("no", { title: "Reactive patterns" }), article("yes", { title: "C++와 접근성을 배우자" })],
      preferences
    );
    expect(items.find((item) => item.sourceId === "no")?.matchedInterests).toEqual([]);
    expect(items.find((item) => item.sourceId === "yes")?.matchedInterests).toEqual(["C++", "접근성"]);
  });

  it("관심 키워드가 맞으면 앞으로 온다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T01:00:00Z"));
    const preferences = parseDigestPreferences({ preferredKeywords: ["WebGPU"] });
    const items = prioritize([article("other"), article("match", { title: "WebGPU introduction" })], preferences);
    expect(items[0].sourceId).toBe("match");
  });
});
