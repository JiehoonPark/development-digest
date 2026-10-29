import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { loadPublishedHistory } from "../../src/dedup/published-history.js";
import { normalizeTitleKey } from "../../src/db/repositories/recent-titles.js";

const NOW = new Date("2026-10-29T08:00:00+09:00");
const RSC_URL = "https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components";

let dir: string;

function writeArchive(date: string, items: Array<Record<string, unknown>>): void {
  writeFileSync(
    join(dir, `${date}.json`),
    JSON.stringify({ date, intro: "", sections: [{ category: "tech", items }] })
  );
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "published-history-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("loadPublishedHistory", () => {
  it("이전 발행본의 URL(정규화)과 원제·한국어 제목 키를 모은다", () => {
    writeArchive("2026-10-28", [
      {
        url: `${RSC_URL}/?utm_source=rss#top`,
        title: "Critical Security Vulnerability in React Server Components",
        titleKo: "React Server Components의 치명적 보안 취약점",
      },
    ]);

    const history = loadPublishedHistory(dir, NOW);

    expect(history.archiveCount).toBe(1);
    expect(history.urls.has(RSC_URL)).toBe(true);
    expect(history.titleKeys.has(normalizeTitleKey("Critical Security Vulnerability in React Server Components"))).toBe(true);
    expect(history.titleKeys.has(normalizeTitleKey("React Server Components의 치명적 보안 취약점"))).toBe(true);
  });

  it("오늘 발행본(같은 날 재실행)과 조회 기간 밖 발행본은 제외한다", () => {
    writeArchive("2026-10-29", [{ url: "https://a.dev/today", title: "today" }]);
    writeArchive("2026-09-01", [{ url: "https://a.dev/old", title: "old" }]);
    writeArchive("2026-10-01", [{ url: "https://a.dev/in-range", title: "in range" }]);

    const history = loadPublishedHistory(dir, NOW);

    expect([...history.urls]).toEqual(["https://a.dev/in-range"]);
    expect(history.archiveCount).toBe(1);
  });

  it("손상된 파일·날짜 형식이 아닌 파일·폴더는 건너뛴다", () => {
    writeFileSync(join(dir, "2026-10-27.json"), "{ broken");
    writeFileSync(join(dir, "notes.json"), JSON.stringify({ sections: [{ items: [{ url: "https://x.dev" }] }] }));
    mkdirSync(join(dir, "2026-10-26.json.d"));
    writeArchive("2026-10-28", [{ url: "https://a.dev/ok", title: "ok" }, { title: 3 }]);

    const history = loadPublishedHistory(dir, NOW);

    expect([...history.urls]).toEqual(["https://a.dev/ok"]);
    expect(history.archiveCount).toBe(1);
  });

  it("폴더가 없으면 빈 이력을 돌려준다", () => {
    const history = loadPublishedHistory(join(dir, "missing"), NOW);
    expect(history.urls.size).toBe(0);
    expect(history.archiveCount).toBe(0);
  });
});
