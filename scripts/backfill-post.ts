/**
 * 지난 다이제스트에서 고른 글감으로 심층 글을 직접 써서 과거 날짜로 발행하는 도구(Claude API 없이).
 * 매일 파이프라인과 같은 근거 수집·형식 검사·출처 번호 정리·커버 생성을 쓴다. 다른 점은 글을 사람(에이전트)이 쓴다는 것뿐.
 *
 *   npx tsx scripts/backfill-post.ts research <작업폴더> <원문 URL> --title "<제목>" --publisher "<매체>" --published YYYY-MM-DD [--mdn "<검색어>"]...
 *   npx tsx scripts/backfill-post.ts add-source <작업폴더> <URL>      # 근거 자료 추가(1차 자료 권장)
 *   npx tsx scripts/backfill-post.ts check <작업폴더>                 # draft.md 형식·출처·커버 재료 검사
 *   npx tsx scripts/backfill-post.ts publish <작업폴더> <발행일 YYYY-MM-DD>
 *
 * 작업폴더: sources.json(자료 원문 포함), draft.md(WRITE_PROMPT 와 같은 태그 형식).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { extractArticle } from "../src/extractors/article-extractor.js";
import { renumberCitations } from "../src/post/citations.js";
import { chooseCoverStyle, parseCoverSpec, usableStyles } from "../src/post/cover/cover-spec.js";
import { generateCover } from "../src/post/cover/index.js";
import { estimateReadingMinutes, parseDraft } from "../src/post/draft.js";
import { findCitationIds, lintPost, stripCode } from "../src/post/post-lint.js";
import { loadPublishedPosts, savePost } from "../src/post/post-store.js";
import { gatherResearch } from "../src/post/research.js";
import type { PostData, PostSource, ResearchSource } from "../src/post/types.js";

const MIN_SOURCE_CONTENT = 300;
const MAX_SOURCE_CONTENT = 9000;

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
}

function options(args: string[], name: string): string[] {
  return args.flatMap((arg, index) => (arg === `--${name}` ? [args[index + 1]] : []));
}

function readSources(dir: string): ResearchSource[] {
  return JSON.parse(readFileSync(join(dir, "sources.json"), "utf8")) as ResearchSource[];
}

function writeSources(dir: string, sources: ResearchSource[]): void {
  writeFileSync(join(dir, "sources.json"), `${JSON.stringify(sources, null, 2)}\n`);
}

function describe(sources: ResearchSource[]): void {
  for (const source of sources) {
    console.log(`[${source.id}] ${source.publisher} · ${source.title.slice(0, 80)}\n    ${source.url}\n    본문 ${source.content.length}자`);
  }
}

async function research(dir: string, url: string, args: string[]): Promise<void> {
  mkdirSync(dir, { recursive: true });
  const sources = await gatherResearch(
    {
      url,
      title: option(args, "title") ?? url,
      sourceName: option(args, "publisher") ?? new URL(url).hostname,
      publishedAt: option(args, "published"),
      contentType: "article",
      labels: [],
      relevance: 0,
    },
    options(args, "mdn")
  );
  writeSources(dir, sources);
  describe(sources);
}

async function addSource(dir: string, url: string): Promise<void> {
  const sources = readSources(dir);
  if (sources.some((source) => source.url === url)) {
    console.log("이미 있는 자료입니다");
    return;
  }
  const page = await extractArticle(url);
  if (page.status !== "success" || page.content.length < MIN_SOURCE_CONTENT) {
    console.error(`본문을 가져오지 못했습니다(${page.status}, ${page.content?.length ?? 0}자): ${url}`);
    process.exitCode = 1;
    return;
  }
  const host = new URL(url).hostname.replace(/^www\./, "");
  sources.push({
    id: sources.length + 1,
    title: page.title ?? url,
    publisher: host === "developer.mozilla.org" ? "MDN" : host,
    url,
    content: page.content.slice(0, MAX_SOURCE_CONTENT),
  });
  writeSources(dir, sources);
  describe(sources.slice(-1));
}

/** 형식 검사 + 파이프라인에는 없지만 사람이 쓴 글이라 더 확인할 것들 */
function check(dir: string): boolean {
  const sources = readSources(dir);
  const draft = parseDraft(readFileSync(join(dir, "draft.md"), "utf8"));
  const issues = lintPost({
    title: draft.title,
    dek: draft.dek,
    tldr: draft.tldr,
    body: draft.body,
    actions: draft.actions,
    sourceIds: sources.map((source) => source.id),
  }).map((issue) => `${issue.severity} ${issue.rule}: ${issue.message}`);

  const citedIds = new Set([...draft.tldr, draft.body, ...draft.actions].flatMap((text) => findCitationIds(stripCode(text))));
  const uncited = sources.filter((source) => !citedIds.has(source.id)).map((source) => source.id);
  if (!citedIds.has(1)) issues.push("error main-uncited: 원문 [1] 을 한 번도 인용하지 않았습니다");

  const spec = parseCoverSpec(draft.coverSpec, { title: draft.title, tags: draft.tags });
  if (spec.code) {
    const missing = spec.code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//") && !line.startsWith("/*") && !draft.body.includes(line));
    if (missing.length > 0) issues.push(`error cover-code: 커버 코드가 본문에 없습니다 — ${missing.slice(0, 3).join(" | ")}`);
  }
  if (draft.coverSpec && !spec.keyword) issues.push("warn cover-keyword: 커버 keyword 가 비었습니다");

  console.log(`제목: ${draft.title}\n본문 ${draft.body.length}자 · h2 ${(draft.body.match(/^## /gm) ?? []).length}개 · 출처 인용 ${[...citedIds].sort((a, b) => a - b).join(",")}`);
  if (uncited.length > 0) console.log(`인용하지 않은 자료(발행 때 빠짐): ${uncited.join(",")}`);
  console.log(`커버 가능 형식: ${usableStyles(spec).join(", ") || "(기본형)"} · 로고 ${spec.logos.join(",") || "없음"}`);
  console.log(issues.length === 0 ? "검사 통과" : issues.join("\n"));
  return !issues.some((issue) => issue.startsWith("error"));
}

async function publish(dir: string, date: string): Promise<void> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`발행일 형식이 아닙니다: ${date}`);
  if (!check(dir)) throw new Error("검사를 통과하지 못해 발행하지 않습니다");

  const sources = readSources(dir);
  const draft = parseDraft(readFileSync(join(dir, "draft.md"), "utf8"));
  const renumbered = renumberCitations({
    body: draft.body,
    tldr: draft.tldr,
    actions: draft.actions,
    sources: sources.map(({ content: _content, ...source }): PostSource => source),
  });

  const slug = `${date}-${draft.slug}`;
  // 발행일 기준으로 그 전에 나온 글의 커버 형식을 피한다(최신순)
  const earlierStyles = loadPublishedPosts()
    .filter((post) => post.date < date)
    .map((post) => post.cover?.style)
    .filter((style): style is string => Boolean(style));
  const spec = parseCoverSpec(draft.coverSpec, { title: draft.title, tags: draft.tags });
  console.log(`커버 형식: ${chooseCoverStyle(spec, earlierStyles)}`);
  const cover = await generateCover(slug, spec, draft.coverAlt || draft.title, earlierStyles);

  const post: PostData = {
    slug,
    date,
    title: draft.title,
    dek: draft.dek,
    tags: draft.tags,
    readingMinutes: estimateReadingMinutes(renumbered.body),
    ...(cover ? { cover } : {}),
    tldr: renumbered.tldr,
    body: renumbered.body,
    actions: renumbered.actions,
    sources: renumbered.sources,
  };
  console.log(`발행: ${savePost(post)}`);
}

const [command, dir, ...rest] = process.argv.slice(2);
if (!command || !dir) {
  console.error("사용법은 파일 머리 주석을 보세요");
  process.exit(1);
}

switch (command) {
  case "research":
    await research(dir, rest[0], rest.slice(1));
    break;
  case "add-source":
    await addSource(dir, rest[0]);
    break;
  case "check":
    if (!existsSync(join(dir, "draft.md"))) throw new Error("draft.md 가 없습니다");
    if (!check(dir)) process.exitCode = 1;
    break;
  case "publish":
    await publish(dir, rest[0]);
    break;
  default:
    console.error(`모르는 명령: ${command}`);
    process.exitCode = 1;
}
process.exit();
