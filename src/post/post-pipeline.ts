import { createChildLogger } from "../utils/logger.js";
import { renumberCitations } from "./citations.js";
import { generateCover, parseCoverSpec } from "./cover/index.js";
import { estimateReadingMinutes } from "./draft.js";
import { formatKstDate } from "./kst-date.js";
import { hasPostForDate, loadPublishedPosts, loadRecentPosts, savePost } from "./post-store.js";
import { gatherResearch } from "./research.js";
import { chooseTopic, titleBriefs } from "./topic.js";
import type { PostBrief, PostCandidate, PostData, PostSource } from "./types.js";
import { writePost } from "./writer.js";

const log = createChildLogger("post-pipeline");

/** 최근 이만큼의 글을 주제 선정에 보여줘 같은 주제가 반복되지 않게 한다 */
const RECENT_POST_DAYS = 14;

export type PostRunResult =
  | { status: "published"; slug: string; path: string; revisions: number }
  | { status: "skipped"; reason: string };

/** 이미 글의 근거로 쓴 원문은 다시 후보로 올리지 않는다 */
function excludeCoveredUrls(candidates: PostCandidate[], posts: PostData[]): PostCandidate[] {
  const covered = new Set(posts.flatMap((post) => post.sources.map((source) => source.url)));
  return candidates.filter((candidate) => !covered.has(candidate.url));
}

function formatBriefNote(candidate: PostCandidate): string {
  const date = candidate.publishedAt ? new Date(candidate.publishedAt) : undefined;
  const dateLabel = date && !Number.isNaN(date.getTime()) ? `${date.getMonth() + 1}월 ${date.getDate()}일` : undefined;
  return [candidate.sourceName, dateLabel].filter(Boolean).join(" · ");
}

/**
 * 하루 1편 심층 글: 글감 선정 → 근거 수집 → 작성·형식 검사·사실 검증 → 커버 → 저장.
 * 오늘 글이 이미 있으면 아무것도 하지 않는다(재실행해도 두 편이 생기지 않게).
 */
export async function runPostPipeline(candidates: PostCandidate[], now: Date = new Date()): Promise<PostRunResult> {
  const today = formatKstDate(now);
  if (hasPostForDate(today)) {
    return { status: "skipped", reason: `${today} 글이 이미 있습니다` };
  }

  const pool = excludeCoveredUrls(candidates, loadPublishedPosts());
  const topic = await chooseTopic(pool, loadRecentPosts(today, RECENT_POST_DAYS));
  if (!topic) {
    return { status: "skipped", reason: "깊게 쓸 글감이 없습니다" };
  }

  const research = await gatherResearch(topic.main, topic.mdnQueries);
  const { draft, revisions, warnings } = await writePost(topic.angle, research);
  if (warnings.length > 0) {
    log.warn({ warnings: warnings.map((warning) => warning.message) }, "발행은 하되 확인이 필요한 항목");
  }

  const briefTitles = await titleBriefs(topic.briefs.map((brief) => brief.candidate));
  const researchSources: PostSource[] = research.map(({ content: _content, ...source }) => source);
  const briefSources: PostSource[] = topic.briefs.map(({ candidate }, index) => ({
    id: research.length + index + 1,
    title: candidate.title,
    publisher: candidate.sourceName,
    url: candidate.url,
    publishedAt: candidate.publishedAt?.slice(0, 10),
  }));

  const renumbered = renumberCitations({
    body: draft.body,
    tldr: draft.tldr,
    actions: draft.actions,
    sources: [...researchSources, ...briefSources],
    keepIds: briefSources.map((source) => source.id),
  });

  const briefs: PostBrief[] = topic.briefs.map(({ candidate, label }, index) => ({
    label,
    title: briefTitles[index],
    note: formatBriefNote(candidate),
    sourceId: renumbered.idMap.get(briefSources[index].id)!,
  }));

  const slug = `${today}-${draft.slug}`;
  const recentCoverStyles = loadPublishedPosts()
    .map((published) => published.cover?.style)
    .filter((style): style is string => Boolean(style));
  const coverSpec = parseCoverSpec(draft.coverSpec, { title: draft.title, tags: draft.tags });
  const cover = await generateCover(slug, coverSpec, draft.coverAlt, recentCoverStyles);

  const post: PostData = {
    slug,
    date: today,
    title: draft.title,
    dek: draft.dek,
    tags: draft.tags,
    readingMinutes: estimateReadingMinutes(renumbered.body),
    ...(cover ? { cover } : {}),
    tldr: renumbered.tldr,
    body: renumbered.body,
    actions: renumbered.actions,
    sources: renumbered.sources,
    ...(briefs.length > 0 ? { briefs } : {}),
  };

  const path = savePost(post);
  log.info({ slug, revisions, sources: post.sources.length, hasCover: Boolean(cover) }, "오늘의 글 발행");
  return { status: "published", slug, path, revisions };
}
