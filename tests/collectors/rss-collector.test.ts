import { beforeEach, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => [] as string[]);
const behavior = vi.hoisted(() => ({ browserFails: false }));

vi.mock("rss-parser", () => ({
  default: class {
    private userAgent: string;
    constructor(options: { headers: Record<string, string> }) {
      this.userAgent = options.headers["User-Agent"];
    }
    async parseURL() {
      const isBrowser = this.userAgent.includes("Chrome/");
      calls.push(isBrowser ? "browser" : "bot");
      if (isBrowser && behavior.browserFails) throw new Error("Status code 403");
      return { items: [] };
    }
  },
}));

import { parseFeed } from "../../src/collectors/rss-collector.js";

beforeEach(() => {
  calls.length = 0;
  behavior.browserFails = false;
});

it("브라우저 이름표로 먼저 요청한다", async () => {
  await parseFeed("https://example.com/feed");
  expect(calls).toEqual(["browser"]);
});

it("브라우저 이름표가 막히면 봇 이름표로 한 번 더 요청한다", async () => {
  behavior.browserFails = true;
  await expect(parseFeed("https://example.com/feed")).resolves.toEqual({ items: [] });
  expect(calls).toEqual(["browser", "bot"]);
});
