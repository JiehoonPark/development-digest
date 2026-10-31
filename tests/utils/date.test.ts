import { describe, expect, it } from "vitest";
import { formatDigestDate, formatISODate, getKstWeekday } from "../../src/utils/date.js";

describe("발행일 한국 시간 기준", () => {
  it("실행 머신의 UTC 날짜가 아닌 KST 발행일을 사용한다", () => {
    const date = new Date("2026-10-04T23:00:00Z");
    expect(formatISODate(date)).toBe("2026-10-05");
    expect(formatDigestDate(date)).toBe("2026년 10월 5일 (월)");
  });

  it("KST 월요일 08시는 UTC 일요일 23시여도 월요일(1)이다", () => {
    expect(getKstWeekday(new Date("2026-03-15T23:00:00Z"))).toBe(1);
  });

  it("KST 자정 직전은 그날로 본다", () => {
    expect(formatISODate(new Date("2026-10-31T14:59:59Z"))).toBe("2026-10-31");
  });
});
