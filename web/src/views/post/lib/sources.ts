import type { PostData, PostSource } from "@/shared/config";

const CITATION = /\[(\d+)\]/g;

/** 화면에 보이는 본문·해 볼 것에서 실제로 [n] 으로 인용한 출처 번호(요약은 화면에 내지 않으므로 세지 않는다) */
function citedIds(post: PostData): Set<number> {
  const text = [post.body, ...(post.actions ?? [])].join("\n");
  return new Set([...text.matchAll(CITATION)].map((match) => Number(match[1])));
}

/**
 * 글 끝에 보여 줄 출처. 본문 근거가 아닌 출처(그날의 다른 소식만 가리키던 것)는 뺀다.
 * 번호는 본문 [n] 과 맞아야 하므로 다시 매기지 않는다.
 */
export function getCitedSources(post: PostData): PostSource[] {
  const cited = citedIds(post);
  return post.sources.filter((source) => cited.has(source.id));
}

/** 기사 하나에서 출발한 글이면 그 출처 번호. 주제를 정해 공식 문서로 쓴 글(origin: "topic")은 없음 */
export function getOriginSourceId(post: PostData): number | undefined {
  if (post.origin === "topic") return undefined;
  return post.sources[0]?.id;
}
