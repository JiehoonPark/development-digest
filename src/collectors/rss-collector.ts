import Parser from "rss-parser";
import { BaseCollector } from "./base-collector.js";
import type { CollectedItem } from "./types.js";

const FEED_ACCEPT = "application/rss+xml, application/atom+xml, application/xml, text/xml, */*";
const REQUEST_TIMEOUT_MS = 10_000;

/** 봇 요청을 막는 피드를 위해 브라우저 이름표로 먼저 요청한다 */
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
/**
 * 브라우저 이름표가 오히려 막히는 피드가 있다(우아한형제들 기술블로그: 브라우저 이름표 403, 봇 이름표 200 — 2026-10-31 실측).
 * 첫 요청이 실패하면 원래 쓰던 봇 이름표로 한 번 더 요청한다.
 */
const BOT_USER_AGENT = "Mozilla/5.0 (compatible; DevDigest/1.0; +https://github.com/dev-digest)";

function createParser(userAgent: string): Parser {
  return new Parser({
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      "User-Agent": userAgent,
      Accept: FEED_ACCEPT,
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });
}

const browserParser = createParser(BROWSER_USER_AGENT);
const botParser = createParser(BOT_USER_AGENT);

export async function parseFeed(url: string): ReturnType<Parser["parseURL"]> {
  try {
    return await browserParser.parseURL(url);
  } catch {
    return botParser.parseURL(url);
  }
}

export class RssCollector extends BaseCollector {
  protected async fetchItems(): Promise<CollectedItem[]> {
    const feed = await parseFeed(this.source.url);

    return (feed.items ?? []).slice(0, 20).map((item) =>
      this.buildItem({
        url: item.link ?? "",
        title: item.title ?? "",
        publishedAt: this.safeDate(item.isoDate ?? item.pubDate),
        author: item.creator ?? item["dc:creator"] ?? undefined,
        summary: this.cleanSummary(item.contentSnippet ?? item.content ?? ""),
        contentType: this.source.type === "youtube" ? "video" : "article",
      })
    );
  }

  private safeDate(raw: string | undefined): string {
    if (!raw) return new Date().toISOString();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }

  private cleanSummary(text: string): string {
    return text.replace(/<[^>]*>/g, "").trim().slice(0, 300);
  }
}
