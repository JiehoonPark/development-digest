import { BaseCollector } from "./base-collector.js";
import type { CollectedItem } from "./types.js";

interface RedditPost {
  data: {
    title: string;
    url: string;
    permalink: string;
    score: number;
    created_utc: number;
    author: string;
    selftext?: string;
    is_self: boolean;
    num_comments: number;
  };
}

export class RedditCollector extends BaseCollector {
  protected async fetchItems(): Promise<CollectedItem[]> {
    const res = await fetch(this.source.url, {
      headers: {
        "User-Agent": "DevDigest/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Reddit API ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const posts: RedditPost[] = json?.data?.children ?? [];

    return posts.slice(0, 20).map((post) => {
      const { data } = post;
      const url = data.is_self
        ? `https://www.reddit.com${data.permalink}`
        : data.url;

      return this.buildItem({
        url,
        title: data.title,
        publishedAt: new Date(data.created_utc * 1000).toISOString(),
        author: data.author,
        engagement: data.score,
        summary: data.selftext?.slice(0, 300) ?? undefined,
        contentType: "discussion",
        tags: [this.source.subreddit ?? "reddit"],
      });
    });
  }
}
