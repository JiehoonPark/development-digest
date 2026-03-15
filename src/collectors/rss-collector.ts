import Parser from "rss-parser";
import { BaseCollector } from "./base-collector.js";
import type { CollectedItem } from "./types.js";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; DevDigest/1.0; +https://github.com/dev-digest)",
    Accept:
      "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
});

export class RssCollector extends BaseCollector {
  protected async fetchItems(): Promise<CollectedItem[]> {
    const feed = await parser.parseURL(this.source.url);

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
