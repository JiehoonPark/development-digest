import { findCitationIds, stripCode } from "./post-lint.js";

/**
 * 본문·요약·해 볼 것에서 실제로 인용된 출처만 남기고, 처음 등장한 순서대로 1부터 다시 번호를 매긴다.
 * 짧은 소식(briefs)이 가리키는 출처는 인용되지 않았어도 남긴다 — 링크가 깨지면 안 되기 때문.
 */
export interface Renumbered<T extends { id: number }> {
  body: string;
  tldr: string[];
  actions: string[];
  sources: T[];
  /** 옛 번호 → 새 번호 */
  idMap: Map<number, number>;
}

export function renumberCitations<T extends { id: number }>(input: {
  body: string;
  tldr: string[];
  actions: string[];
  sources: T[];
  keepIds?: number[];
}): Renumbered<T> {
  const order: number[] = [];
  const knownIds = new Set(input.sources.map((source) => source.id));
  const remember = (id: number) => {
    if (knownIds.has(id) && !order.includes(id)) order.push(id);
  };

  for (const text of [...input.tldr, input.body, ...input.actions]) {
    findCitationIds(stripCode(text)).forEach(remember);
  }
  (input.keepIds ?? []).forEach(remember);

  const idMap = new Map(order.map((oldId, index) => [oldId, index + 1]));
  const rewrite = (text: string) => replaceOutsideCode(text, (prose) =>
    prose.replace(/\[(\d+)\]/g, (whole, raw: string) => {
      const next = idMap.get(Number(raw));
      return next === undefined ? whole : `[${next}]`;
    })
  );

  const sources = order
    .map((oldId) => input.sources.find((source) => source.id === oldId)!)
    .map((source) => ({ ...source, id: idMap.get(source.id)! }));

  return {
    body: rewrite(input.body),
    tldr: input.tldr.map(rewrite),
    actions: input.actions.map(rewrite),
    sources,
    idMap,
  };
}

/** 코드 블록·인라인 코드는 그대로 두고 나머지 글에만 변환을 적용한다 */
function replaceOutsideCode(markdown: string, transform: (prose: string) => string): string {
  const CODE = /(```[\s\S]*?```|`[^`\n]*`)/g;
  return markdown
    .split(CODE)
    .map((part, index) => (index % 2 === 1 ? part : transform(part)))
    .join("");
}
