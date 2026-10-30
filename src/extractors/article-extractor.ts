import * as cheerio from "cheerio";

/** `$(selector).first()` 의 결과 타입 — cheerio 가 노드 타입을 따로 export 하지 않아 추론한다 */
type ContentRoot = ReturnType<ReturnType<cheerio.CheerioAPI>["first"]>;
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("article-extractor");

export interface ExtractionResult {
  url: string;
  content: string;
  wordCount: number;
  status: "success" | "failed";
  error?: string;
  /** og:title 또는 <title> */
  title?: string;
  /** og:image 절대 URL */
  image?: string;
  /** 본문 영역의 링크(절대 URL, 중복 제거) — 심층 글의 1차 자료 후보 */
  links?: string[];
}

const CONTENT_SELECTORS = [
  "article",
  "[role='main']",
  ".post-content",
  ".article-body",
  ".entry-content",
  ".markdown-body",
  ".crayons-article__body",
  "#content",
  "main",
];

/** 어디에 있든 본문이 아닌 태그 */
const GLOBAL_NOISE_TAGS = ["script", "style", "iframe", "noscript", "svg"];
/** 본문 영역 안에 있을 때 지우는 태그 */
const NOISE_TAGS = ["nav", "header", "footer", "aside"];

/** 클래스 토큰을 `-`·`_` 로 나눈 조각이 이 단어와 같으면 본문이 아닌 부속 영역으로 본다 */
const NOISE_CLASS_WORDS = new Set([
  "sidebar", "comment", "comments", "share", "sharing", "related", "newsletter",
  "ad", "ads", "advert", "social", "nav", "navbar", "navigation", "menu",
  "cookie", "cookies", "popup", "banner",
]);

/**
 * Tailwind 임의값 유틸리티(`[&_.comment]:pt-0`, `max-w-(--x)`)는 스타일 규칙이지 영역 이름이 아니다.
 * 이런 토큰까지 검사하면 본문 컨테이너 전체가 노이즈로 지워진다(nextjs.org 블로그에서 확인).
 */
const UTILITY_TOKEN_CHARS = /[[\]():!&/]/;

export function isNoiseClass(className: string): boolean {
  return className
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token && !UTILITY_TOKEN_CHARS.test(token))
    .some((token) => token.split(/[-_]+/).some((part) => NOISE_CLASS_WORDS.has(part)));
}

const MIN_ROOT_TEXT = 200;

/**
 * 본문 영역을 고르고, 노이즈는 그 영역 "안에서만" 지운다.
 * 문서 전체에서 지우면 본문을 감싼 레이아웃(MDN 의 `layout__2-sidebars-inline`)까지 지워져 본문이 사라진다.
 */
function findContentRoot($: cheerio.CheerioAPI): ContentRoot | undefined {
  $(GLOBAL_NOISE_TAGS.join(",")).remove();
  for (const selector of CONTENT_SELECTORS) {
    const el: ContentRoot = $(selector).first();
    if (el.length === 0) continue;
    el.find(NOISE_TAGS.join(",")).remove();
    el.find("[class]")
      .filter((_, child) => isNoiseClass($(child).attr("class") ?? ""))
      .remove();
    if (el.text().trim().length > MIN_ROOT_TEXT) return el;
  }
  return undefined;
}

const SKIP_DOMAINS = [
  "twitter.com", "x.com",
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "t.co",
];

// 아티클 생성 입력으로 쓰이므로 넉넉하게 (buildArticleInput 이 12000 에서 자름)
const MAX_CONTENT_LENGTH = 12000;
const FETCH_TIMEOUT_MS = 10_000;

export function shouldSkipExtraction(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return SKIP_DOMAINS.some((d) => hostname.includes(d));
  } catch {
    return true;
  }
}

export async function extractArticle(url: string): Promise<ExtractionResult> {
  if (shouldSkipExtraction(url)) {
    return { url, content: "", wordCount: 0, status: "failed", error: "Skipped domain" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DevDigest/1.0; +https://github.com/dev-digest)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { url, content: "", wordCount: 0, status: "failed", error: `HTTP ${res.status}` };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return { url, content: "", wordCount: 0, status: "failed", error: "Not HTML" };
    }

    const html = await res.text();
    const { content, ...page } = parsePage(html, res.url || url);

    if (content.length < 100) {
      return { url, content: "", wordCount: 0, status: "failed", error: "Content too short" };
    }

    log.debug({ url, length: content.length }, "본문 추출 성공");

    return {
      url,
      content,
      wordCount: content.split(/\s+/).length,
      status: "success",
      ...page,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.debug({ url, error: message }, "본문 추출 실패");
    return { url, content: "", wordCount: 0, status: "failed", error: message };
  }
}

const MAX_LINKS = 80;

/** 본문 텍스트·제목·대표 이미지·본문 링크를 한 번에 읽는다 */
function parsePage(html: string, pageUrl: string): Pick<ExtractionResult, "content" | "title" | "image" | "links"> {
  const $ = cheerio.load(html);
  const toAbsolute = (href: string | undefined): string | undefined => {
    if (!href) return undefined;
    try {
      const absolute = new URL(href, pageUrl);
      return absolute.protocol === "https:" || absolute.protocol === "http:" ? absolute.href.split("#")[0] : undefined;
    } catch {
      return undefined;
    }
  };

  // 메타 정보는 노이즈 제거 전에 읽는다
  const title = ($('meta[property="og:title"]').attr("content") ?? $("title").first().text()).trim() || undefined;
  const image = toAbsolute($('meta[property="og:image"]').attr("content"));

  const root = findContentRoot($);
  const content = root ? cleanText(root.text()) : collectParagraphs($);

  const pageWithoutHash = pageUrl.split("#")[0];
  const links = [
    ...new Set(
      (root ?? $("body").first())
        .find("a[href]")
        .map((_, el) => toAbsolute($(el).attr("href")))
        .get()
        // 같은 사이트 문서 링크(nextjs.org/docs 등)도 1차 자료라 남기고, 자기 자신만 뺀다
        .filter((href): href is string => Boolean(href) && href !== pageWithoutHash)
    ),
  ].slice(0, MAX_LINKS);

  return { content: content.slice(0, MAX_CONTENT_LENGTH), title, image, links };
}

/** 본문 영역을 못 찾은 페이지: 내비게이션 밖의 긴 문단만 모은다 */
function collectParagraphs($: cheerio.CheerioAPI): string {
  const MIN_PARAGRAPH = 30;
  $(NOISE_TAGS.join(",")).remove();
  const paragraphs = $("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((text) => text.length > MIN_PARAGRAPH);
  return cleanText(paragraphs.join("\n\n"));
}

function cleanText(text: string): string {
  return text
    .replace(/\t/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .trim();
}
