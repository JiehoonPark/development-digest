import * as cheerio from "cheerio";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("article-extractor");

export interface ExtractionResult {
  url: string;
  content: string;
  wordCount: number;
  status: "success" | "failed";
  error?: string;
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

const NOISE_SELECTORS = [
  "script", "style", "nav", "header", "footer", "aside",
  "iframe", "noscript", "svg",
  "[class*='sidebar']", "[class*='comment']", "[class*='share']",
  "[class*='related']", "[class*='newsletter']", "[class*='ad-']",
  "[class*='social']", "[class*='nav']", "[class*='menu']",
  "[class*='cookie']", "[class*='popup']", "[class*='banner']",
];

const SKIP_DOMAINS = [
  "twitter.com", "x.com",
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "t.co",
];

const MAX_CONTENT_LENGTH = 5000;
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
    const content = extractContent(html);

    if (content.length < 100) {
      return { url, content: "", wordCount: 0, status: "failed", error: "Content too short" };
    }

    log.debug({ url, length: content.length }, "본문 추출 성공");

    return {
      url,
      content,
      wordCount: content.split(/\s+/).length,
      status: "success",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.debug({ url, error: message }, "본문 추출 실패");
    return { url, content: "", wordCount: 0, status: "failed", error: message };
  }
}

function extractContent(html: string): string {
  const $ = cheerio.load(html);

  // 노이즈 요소 제거
  for (const selector of NOISE_SELECTORS) {
    $(selector).remove();
  }

  // 콘텐츠 선택자 순서대로 탐색
  let contentText: string | null = null;

  for (const selector of CONTENT_SELECTORS) {
    const el = $(selector);
    if (el.length > 0) {
      const text = el.text().trim();
      if (text.length > 200) {
        contentText = text;
        break;
      }
    }
  }

  // fallback: body에서 p 태그 텍스트 수집
  if (!contentText) {
    const paragraphs = $("p")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((t) => t.length > 30);

    return cleanText(paragraphs.join("\n\n")).slice(0, MAX_CONTENT_LENGTH);
  }

  return cleanText(contentText).slice(0, MAX_CONTENT_LENGTH);
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
