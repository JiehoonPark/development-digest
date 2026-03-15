import { execSync } from "child_process";
import { readFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { createChildLogger } from "../utils/logger.js";
import type { ExtractionResult } from "./article-extractor.js";

const log = createChildLogger("youtube-transcript");

const MAX_TRANSCRIPT_LENGTH = 5000;

export async function extractYoutubeTranscript(url: string): Promise<ExtractionResult> {
  const videoId = parseVideoId(url);
  if (!videoId) {
    return { url, content: "", wordCount: 0, status: "failed", error: "Invalid YouTube URL" };
  }

  // yt-dlp 사용 가능 여부 확인
  if (!isYtDlpAvailable()) {
    return fallbackToLibrary(url, videoId);
  }

  try {
    const content = extractWithYtDlp(videoId);
    if (content.length > 0) {
      log.debug({ videoId, length: content.length }, "yt-dlp 자막 추출 성공");
      return { url, content, wordCount: content.split(/\s+/).length, status: "success" };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.debug({ videoId, error: message }, "yt-dlp 실패 — 라이브러리 폴백");
  }

  // yt-dlp 실패 시 기존 라이브러리 폴백
  return fallbackToLibrary(url, videoId);
}

function extractWithYtDlp(videoId: string): string {
  const tmpFile = join(tmpdir(), `dev-digest-yt-${videoId}`);
  const srtPath = `${tmpFile}.en.srt`;
  const srtPathOrig = `${tmpFile}.en-orig.srt`;

  try {
    // 자동 생성 자막 다운로드 (en-orig 우선, en 폴백)
    execSync(
      `yt-dlp --write-auto-sub --sub-lang "en-orig,en" --sub-format srt --skip-download --output "${tmpFile}" "https://www.youtube.com/watch?v=${videoId}" 2>/dev/null`,
      { timeout: 15000, stdio: "pipe" }
    );

    // SRT 파일 찾기
    const actualPath = existsSync(srtPathOrig) ? srtPathOrig : existsSync(srtPath) ? srtPath : null;
    if (!actualPath) return "";

    const srt = readFileSync(actualPath, "utf-8");
    return parseSrt(srt);
  } finally {
    // 임시 파일 정리
    for (const p of [srtPath, srtPathOrig]) {
      try { if (existsSync(p)) unlinkSync(p); } catch {}
    }
  }
}

function parseSrt(srt: string): string {
  return srt
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (/^\d+$/.test(trimmed)) return false;             // 시퀀스 번호
      if (/^\d{2}:\d{2}/.test(trimmed)) return false;      // 타임스탬프
      return true;
    })
    .map((line) => line.trim())
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_TRANSCRIPT_LENGTH);
}

let _ytDlpChecked: boolean | null = null;

function isYtDlpAvailable(): boolean {
  if (_ytDlpChecked !== null) return _ytDlpChecked;
  try {
    execSync("which yt-dlp", { stdio: "pipe" });
    _ytDlpChecked = true;
  } catch {
    _ytDlpChecked = false;
    log.warn("yt-dlp 미설치 — youtube-transcript 라이브러리만 사용");
  }
  return _ytDlpChecked;
}

async function fallbackToLibrary(url: string, videoId: string): Promise<ExtractionResult> {
  try {
    const { YoutubeTranscript } = await import("youtube-transcript/dist/youtube-transcript.esm.js");

    let segments: Array<{ text: string }> | null = null;

    for (const lang of ["ko", "en", undefined]) {
      try {
        segments = lang
          ? await YoutubeTranscript.fetchTranscript(videoId, { lang })
          : await YoutubeTranscript.fetchTranscript(videoId);
        if (segments?.length) break;
      } catch {
        continue;
      }
    }

    if (!segments || segments.length === 0) {
      return { url, content: "", wordCount: 0, status: "failed", error: "No transcript available" };
    }

    const content = segments
      .map((s) => s.text.trim())
      .filter((t) => t.length > 0)
      .join(" ")
      .replace(/\s{2,}/g, " ")
      .slice(0, MAX_TRANSCRIPT_LENGTH);

    return { url, content, wordCount: content.split(/\s+/).length, status: "success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { url, content: "", wordCount: 0, status: "failed", error: message };
  }
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
