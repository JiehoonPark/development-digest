import type { ScoredItem } from "../prioritizer/scoring.js";

export function buildFilterInput(items: ScoredItem[]): string {
  return items
    .map(
      (item, i) =>
        `[${i}] ${item.title}\n    URL: ${item.url}\n    소스: ${item.sourceName} | 점수: ${item.score}${item.engagement ? ` | engagement: ${item.engagement}` : ""}`
    )
    .join("\n\n");
}

export function buildSummarizeInput(
  items: Array<{ index: number; title: string; url: string; summary?: string }>
): string {
  return items
    .map(
      (item) =>
        `[${item.index}] ${item.title}\n    URL: ${item.url}${item.summary ? `\n    미리보기: ${item.summary}` : ""}`
    )
    .join("\n\n");
}

export function buildEditorialInput(
  sections: Record<string, Array<{ index: number; title: string; summary: string }>>
): string {
  const parts: string[] = [];

  for (const [section, items] of Object.entries(sections)) {
    parts.push(`## ${section}`);
    for (const item of items) {
      parts.push(`[${item.index}] ${item.title}: ${item.summary}`);
    }
    parts.push("");
  }

  return parts.join("\n");
}
