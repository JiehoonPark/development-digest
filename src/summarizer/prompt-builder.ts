import type { ScoredItem } from "../prioritizer/scoring.js";

/**
 * Claude 분류 단계 입력. 최근 3일 이내 다룬 제목 목록을 같이 전달해
 * Claude 가 "같은 스토리의 후속/반복" 을 인식하고 relevance 를 낮추게 한다.
 */
export function buildFilterInput(
  items: ScoredItem[],
  recentTitles: string[] = []
): string {
  const recentContext =
    recentTitles.length > 0
      ? [
          "## 최근 3일간 이미 다룬 주제",
          ...recentTitles.slice(0, 60).map((t) => `- ${t}`),
          "",
          "위 주제와 실질적으로 같은 내용(새로운 정보·중대 업데이트·후속 패치 없음)이면 relevance 를 30 이하로 낮추세요.",
          "의미 있는 후속(예: 중대 버그 발견, 버전 업데이트, 권고 변경)이면 기존 기준대로 평가하세요.",
          "",
          "---",
          "",
        ].join("\n")
      : "";

  const itemsList = items
    .map(
      (item, i) =>
        `[${i}] ${item.title}\n    URL: ${item.url}\n    소스: ${item.sourceName} | 점수: ${item.score}${item.engagement ? ` | engagement: ${item.engagement}` : ""}`
    )
    .join("\n\n");

  return recentContext + itemsList;
}

export function buildSummarizeInput(
  items: Array<{
    index: number;
    title: string;
    url: string;
    summary?: string;
    fullContent?: string;
    contentType?: string;
  }>
): string {
  return items
    .map((item) => {
      const parts = [`[${item.index}] ${item.title}`, `    URL: ${item.url}`];

      if (item.fullContent) {
        const label = item.contentType === "video" ? "트랜스크립트" : "본문";
        parts.push(`    ${label}:\n${item.fullContent}`);
      } else if (item.summary) {
        parts.push(`    미리보기: ${item.summary}`);
      }

      return parts.join("\n");
    })
    .join("\n\n---\n\n");
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
