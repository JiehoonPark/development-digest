import { BaseCollector } from "./base-collector.js";
import type { CollectedItem } from "./types.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("reddit");

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

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET 환경변수가 필요합니다. https://www.reddit.com/prefs/apps 에서 발급하세요."
    );
  }

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "DevDigest/1.0",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Reddit OAuth2 토큰 발급 실패: ${res.status}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  log.info("OAuth2 토큰 발급 완료");
  return cachedToken.value;
}

export class RedditCollector extends BaseCollector {
  protected async fetchItems(): Promise<CollectedItem[]> {
    const token = await getAccessToken();

    const apiUrl = this.source.url.replace(
      "https://www.reddit.com",
      "https://oauth.reddit.com"
    );

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "DevDigest/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Reddit API ${res.status}: ${res.statusText}`);
    }

    const json = (await res.json()) as { data?: { children?: RedditPost[] } };
    const posts = json?.data?.children ?? [];

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
        summary: data.selftext?.slice(0, 300) || undefined,
        contentType: "discussion",
        tags: [this.source.subreddit ?? "reddit"],
      });
    });
  }
}
