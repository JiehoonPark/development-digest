import { BaseCollector } from "./base-collector.js";
import type { CollectedItem } from "./types.js";

interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  time: number;
  by: string;
  descendants?: number;
}

const HN_API = "https://hacker-news.firebaseio.com/v0";
const TOP_COUNT = 30;

export class HackernewsCollector extends BaseCollector {
  protected async fetchItems(): Promise<CollectedItem[]> {
    const topRes = await fetch(`${HN_API}/topstories.json`);
    const topIds: number[] = await topRes.json();

    const stories = await Promise.all(
      topIds.slice(0, TOP_COUNT).map((id) => this.fetchStory(id))
    );

    return stories
      .filter((s): s is HNStory => s !== null && !!s.url)
      .map((story) =>
        this.buildItem({
          url: story.url!,
          title: story.title,
          publishedAt: new Date(story.time * 1000).toISOString(),
          author: story.by,
          engagement: story.score,
          contentType: "discussion",
          tags: ["hackernews"],
        })
      );
  }

  private async fetchStory(id: number): Promise<HNStory | null> {
    try {
      const res = await fetch(`${HN_API}/item/${id}.json`);
      return await res.json();
    } catch {
      return null;
    }
  }
}
