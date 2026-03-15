import { BaseCollector } from "./base-collector.js";
import type { CollectedItem } from "./types.js";

/**
 * YouTube RSS 피드를 사용하여 최신 영상을 수집.
 * API 키 없이도 동작하며, quota를 소모하지 않음.
 */
export class YoutubeCollector extends BaseCollector {
  protected async fetchItems(): Promise<CollectedItem[]> {
    const rssUrl = this.source.url;
    const res = await fetch(rssUrl);

    if (!res.ok) {
      throw new Error(`YouTube RSS ${res.status}`);
    }

    const xml = await res.text();
    return this.parseAtomFeed(xml);
  }

  private parseAtomFeed(xml: string): CollectedItem[] {
    const entries: CollectedItem[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const title = this.extractTag(entry, "title");
      const videoId = this.extractTag(entry, "yt:videoId");
      const published = this.extractTag(entry, "published");
      const author = this.extractTag(entry, "name");

      if (title && videoId) {
        entries.push(
          this.buildItem({
            url: `https://www.youtube.com/watch?v=${videoId}`,
            title,
            publishedAt: published ?? new Date().toISOString(),
            author: author ?? this.source.name,
            contentType: "video",
            tags: ["youtube"],
          })
        );
      }

      if (entries.length >= 5) break;
    }

    return entries;
  }

  private extractTag(xml: string, tag: string): string | undefined {
    const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
    const match = regex.exec(xml);
    return match?.[1]?.trim();
  }
}
