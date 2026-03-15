export type SourceType = "rss" | "hackernews" | "reddit" | "youtube" | "github-trending";

export type SourceCategory =
  | "community-overseas"
  | "community-domestic"
  | "tech-blog-kr"
  | "framework-blog"
  | "newsletter"
  | "influencer-overseas"
  | "influencer-domestic"
  | "conference";

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  category: SourceCategory;
  url: string;
  weight: number; // 1-10, 우선순위 가중치
  language: "en" | "ko";
  // YouTube 전용
  channelId?: string;
  playlistId?: string;
  // Reddit 전용
  subreddit?: string;
}
