import type { SourceCategory } from "../../config/sources/types.js";

export interface CollectedItem {
  url: string;
  title: string;
  sourceId: string;
  sourceName: string;
  category: SourceCategory;
  language: "en" | "ko";
  publishedAt: string; // ISO 8601
  author?: string;
  summary?: string;
  engagement?: number; // HN points, Reddit upvotes 등
  tags?: string[];
  contentType: "article" | "video" | "repo" | "discussion";
  fullContent?: string;
  extractionStatus?: "pending" | "success" | "failed" | "skipped";
}

export interface CollectorResult {
  sourceId: string;
  items: CollectedItem[];
  error?: string;
}
