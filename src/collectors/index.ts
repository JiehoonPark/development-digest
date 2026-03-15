import type { Source } from "../../config/sources/types.js";
import { BaseCollector } from "./base-collector.js";
import { RssCollector } from "./rss-collector.js";
import { HackernewsCollector } from "./hackernews-collector.js";
import { RedditCollector } from "./reddit-collector.js";
import { YoutubeCollector } from "./youtube-collector.js";
import { GithubTrendingCollector } from "./github-trending-collector.js";

export type { CollectedItem, CollectorResult } from "./types.js";

export function createCollector(source: Source): BaseCollector {
  switch (source.type) {
    case "hackernews":
      return new HackernewsCollector(source);
    case "reddit":
      return new RedditCollector(source);
    case "youtube":
      return new YoutubeCollector(source);
    case "github-trending":
      return new GithubTrendingCollector(source);
    case "rss":
    default:
      return new RssCollector(source);
  }
}
