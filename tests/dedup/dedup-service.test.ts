import { describe, it, expect } from "vitest";
import type { CollectedItem } from "../../src/collectors/types.js";

// URL 정규화 함수만 단위 테스트 (DB 의존 없이)
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("ref");
    return u.toString().replace(/\/+$/, "");
  } catch {
    return url;
  }
}

describe("normalizeUrl", () => {
  it("UTM 파라미터를 제거한다", () => {
    const url = "https://example.com/article?utm_source=twitter&utm_medium=social";
    expect(normalizeUrl(url)).toBe("https://example.com/article");
  });

  it("hash를 제거한다", () => {
    const url = "https://example.com/article#section1";
    expect(normalizeUrl(url)).toBe("https://example.com/article");
  });

  it("trailing slash를 제거한다", () => {
    const url = "https://example.com/article/";
    expect(normalizeUrl(url)).toBe("https://example.com/article");
  });

  it("ref 파라미터를 제거한다", () => {
    const url = "https://example.com/article?ref=newsletter";
    expect(normalizeUrl(url)).toBe("https://example.com/article");
  });

  it("유효하지 않은 URL은 그대로 반환한다", () => {
    expect(normalizeUrl("not-a-url")).toBe("not-a-url");
  });
});
