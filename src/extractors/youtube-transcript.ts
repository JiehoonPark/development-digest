import { createChildLogger } from "../utils/logger.js";
import type { ExtractionResult } from "./article-extractor.js";

const log = createChildLogger("youtube-transcript");

const MAX_TRANSCRIPT_LENGTH = 5000;

// youtube-transcript 패키지의 ESM/CJS 호환 문제로 직접 ESM 경로 import
async function getTranscriptFetcher() {
  const { YoutubeTranscript } = await import("youtube-transcript/dist/youtube-transcript.esm.js");
  return YoutubeTranscript;
}

export async function extractYoutubeTranscript(url: string): Promise<ExtractionResult> {
  const videoId = parseVideoId(url);
  if (!videoId) {
    return { url, content: "", wordCount: 0, status: "failed", error: "Invalid YouTube URL" };
  }

  try {
    const YT = await getTranscriptFetcher();

    // 한국어 자막 우선
    let segments: Array<{ text: string }> | null = null;

    try {
      segments = await YT.fetchTranscript(videoId, { lang: "ko" });
    } catch {
      // 한국어 없으면 영어로 재시도
      try {
        segments = await YT.fetchTranscript(videoId, { lang: "en" });
      } catch {
        // 언어 지정 없이 기본 자막 시도
        try {
          segments = await YT.fetchTranscript(videoId);
        } catch {
          segments = null;
        }
      }
    }

    if (!segments || segments.length === 0) {
      return { url, content: "", wordCount: 0, status: "failed", error: "No transcript available" };
    }

    const content = joinTranscript(segments);
    log.debug({ videoId, length: content.length }, "자막 추출 성공");
    return { url, content, wordCount: content.split(/\s+/).length, status: "success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.debug({ videoId, error: message }, "자막 추출 실패");
    return { url, content: "", wordCount: 0, status: "failed", error: message };
  }
}

function joinTranscript(segments: Array<{ text: string }>): string {
  return segments
    .map((s) => s.text.trim())
    .filter((t) => t.length > 0)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .slice(0, MAX_TRANSCRIPT_LENGTH);
}

function parseVideoId(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com") && u.searchParams.has("v")) {
      return u.searchParams.get("v");
    }

    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1);
    }

    return null;
  } catch {
    return null;
  }
}
