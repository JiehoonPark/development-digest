import { describe, it, expect } from "vitest";

// normalizeTitleKey 로직을 테스트용으로 복제 (DB 의존 없이 단위 테스트).
// 실제 구현과 동일해야 하며, 변경 시 src/db/repositories/recent-titles.ts 와 함께 수정할 것.
function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

describe("normalizeTitleKey", () => {
  it("같은 제목을 대소문자/공백 무관하게 정규화한다", () => {
    expect(normalizeTitleKey("React 19 Released")).toBe("react 19 released");
    expect(normalizeTitleKey("  React  19   Released  ")).toBe("react 19 released");
  });

  it("구두점과 괄호를 공백으로 바꾼다", () => {
    expect(normalizeTitleKey("React Server Components: 보안 취약점 (CVE-2025-01)"))
      .toBe("react server components 보안 취약점 cve 2025 01");
  });

  it("이모지를 제거한다", () => {
    expect(normalizeTitleKey("🔥 React 19 출시!")).toBe("react 19 출시");
  });

  it("다른 구분자(-, _, /)도 공백화한다", () => {
    expect(normalizeTitleKey("Next.js 16.2 - Turbopack/Improved")).toBe(
      "next js 16 2 turbopack improved"
    );
  });

  it("한국어/영어 혼합을 유지한다", () => {
    expect(normalizeTitleKey("React 19의 새 기능 — Actions API")).toBe(
      "react 19의 새 기능 actions api"
    );
  });

  it("동일 스토리가 서로 다른 소스에서 동일 키로 매핑되는지 확인", () => {
    const a = normalizeTitleKey("React 19 정식 릴리스");
    const b = normalizeTitleKey("React 19 정식 릴리스");
    expect(a).toBe(b);
  });

  it("내용이 달라지면 다른 키로 매핑된다", () => {
    const a = normalizeTitleKey("React 19 정식 릴리스");
    const b = normalizeTitleKey("React 19.1 보안 패치 릴리스");
    expect(a).not.toBe(b);
  });
});
