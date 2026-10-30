import pMap from "p-map";
import { extractArticle } from "../extractors/article-extractor.js";
import { createChildLogger } from "../utils/logger.js";
import type { PostCandidate, ResearchSource } from "./types.js";

const log = createChildLogger("post-research");

/**
 * 1차 자료로 인정하는 도메인. 원문이 링크한 곳 중 여기에 해당하는 것만 근거로 따라간다.
 * 커뮤니티·SNS·마케팅 페이지는 근거로 쓰지 않는다.
 */
const PRIMARY_SOURCE_HOSTS = [
  "developer.mozilla.org",
  "github.com",
  "web.dev",
  "developer.chrome.com",
  "w3.org",
  "whatwg.org",
  "tc39.es",
  "nodejs.org",
  "react.dev",
  "nextjs.org",
  "vuejs.org",
  "svelte.dev",
  "angular.dev",
  "typescriptlang.org",
  "vite.dev",
  "vitejs.dev",
  "tailwindcss.com",
  "webkit.org",
  "caniuse.com",
  "deno.com",
  "bun.sh",
  "astro.build",
  "remix.run",
  "storybook.js.org",
  "playwright.dev",
  "vitest.dev",
  "eslint.org",
  "biomejs.dev",
];

const MAX_FOLLOWED_LINKS = 4;
const MAX_MDN_REFERENCES = 2;
const MIN_SOURCE_CONTENT = 300;
/** 작성 모델 입력이 지나치게 커지지 않도록 자료당 상한 */
const MAX_SOURCE_CONTENT = 9000;
const FETCH_CONCURRENCY = 3;

function isPrimarySource(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return PRIMARY_SOURCE_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

/** GitHub 링크 중 저장소 홈·이슈 목록 같은 얕은 페이지는 근거가 약해 뺀다 */
function isSpecificPage(url: string): boolean {
  const { hostname, pathname } = new URL(url);
  if (hostname !== "github.com") return true;
  const segments = pathname.split("/").filter(Boolean);
  return segments.length >= 4; // owner/repo/(blob|pull|releases|issues)/...
}

export function pickFollowLinks(links: string[], mainUrl: string): string[] {
  return links
    .filter((link) => link !== mainUrl && isPrimarySource(link) && isSpecificPage(link))
    .slice(0, MAX_FOLLOWED_LINKS);
}

/** MDN 검색 API(공개, 키 불필요)로 개념 문서 1건을 찾는다 */
async function findMdnReference(query: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US&size=1`);
    if (!res.ok) return undefined;
    const data = (await res.json()) as { documents?: Array<{ mdn_url: string }> };
    const path = data.documents?.[0]?.mdn_url;
    return path ? `https://developer.mozilla.org${path}` : undefined;
  } catch {
    return undefined;
  }
}

function publisherOf(url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host === "developer.mozilla.org") return "MDN";
  if (host === "github.com") return `GitHub · ${new URL(url).pathname.split("/").slice(1, 3).join("/")}`;
  return host;
}

/**
 * 오늘 글의 근거 자료를 모은다. [1] 은 항상 원문.
 * 원문 본문을 확보하지 못하면 글을 쓰지 않는다 — 근거 없는 글보다 쉬는 날이 낫다.
 */
export async function gatherResearch(main: PostCandidate, mdnQueries: string[]): Promise<ResearchSource[]> {
  const mainPage = await extractArticle(main.url);
  const mainContent = mainPage.status === "success" ? mainPage.content : main.fullContent ?? "";
  if (mainContent.length < MIN_SOURCE_CONTENT) {
    throw new Error(`원문 본문을 확보하지 못했습니다: ${main.url}`);
  }

  const sources: ResearchSource[] = [
    {
      id: 1,
      title: main.title,
      publisher: main.sourceName,
      url: main.url,
      publishedAt: main.publishedAt?.slice(0, 10),
      content: mainContent.slice(0, MAX_SOURCE_CONTENT * 2),
    },
  ];

  const mdnUrls = (
    await Promise.all(mdnQueries.slice(0, MAX_MDN_REFERENCES).map(findMdnReference))
  ).filter((url): url is string => Boolean(url));
  const followUrls = [...new Set([...pickFollowLinks(mainPage.links ?? [], main.url), ...mdnUrls])];

  const fetched = await pMap(followUrls, extractArticle, { concurrency: FETCH_CONCURRENCY });
  for (const page of fetched) {
    if (page.status !== "success" || page.content.length < MIN_SOURCE_CONTENT) continue;
    sources.push({
      id: sources.length + 1,
      title: page.title ?? page.url,
      publisher: publisherOf(page.url),
      url: page.url,
      content: page.content.slice(0, MAX_SOURCE_CONTENT),
    });
  }

  log.info(
    { main: main.url, candidates: followUrls.length, collected: sources.length - 1 },
    "근거 자료 수집 완료"
  );
  return sources;
}
