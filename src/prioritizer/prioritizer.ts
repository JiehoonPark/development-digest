import type { CollectedItem } from "../collectors/types.js";
import { calculateScore, type ScoredItem } from "./scoring.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("prioritizer");

const MAX_ITEMS = 50;

export function prioritize(items: CollectedItem[]): ScoredItem[] {
  const scored = items.map((item) => ({
    ...item,
    score: calculateScore(item),
  }));

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, MAX_ITEMS);

  log.info(
    {
      total: items.length,
      selected: top.length,
      topScore: top[0]?.score ?? 0,
      bottomScore: top[top.length - 1]?.score ?? 0,
    },
    "우선순위 정렬 완료"
  );

  return top;
}
