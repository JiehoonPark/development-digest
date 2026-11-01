const SUBTITLE_SEPARATOR = /\s+[—–]\s+/;

/** "제목 — 부제" → { main: "제목", sub: "부제" }. 목록에서 큰 글자는 앞부분만 쓴다 */
export function splitTitle(title: string): { main: string; sub?: string } {
  const [main, ...rest] = title.split(SUBTITLE_SEPARATOR);
  return rest.length > 0 ? { main, sub: rest.join(" — ") } : { main };
}
