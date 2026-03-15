import { communitiesOverseas } from "./communities-overseas.js";
import { communitiesDomestic } from "./communities-domestic.js";
import { techBlogsKr } from "./tech-blogs-kr.js";
import { frameworkBlogs } from "./framework-blogs.js";
import { newsletters } from "./newsletters.js";
import { influencersOverseas } from "./influencers-overseas.js";
import { influencersDomestic } from "./influencers-domestic.js";
import { conferences } from "./conferences.js";
import type { Source, SourceCategory } from "./types.js";

export type { Source, SourceType, SourceCategory } from "./types.js";

export const allSources: Source[] = [
  ...communitiesOverseas,
  ...communitiesDomestic,
  ...techBlogsKr,
  ...frameworkBlogs,
  ...newsletters,
  ...influencersOverseas,
  ...influencersDomestic,
  ...conferences,
];

export function getSourcesByCategory(category: SourceCategory): Source[] {
  return allSources.filter((s) => s.category === category);
}

export function getSourceById(id: string): Source | undefined {
  return allSources.find((s) => s.id === id);
}
