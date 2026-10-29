import { describe, it, expect } from "vitest";
import { normalizeUrl } from "../../src/dedup/normalize-url.js";

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
