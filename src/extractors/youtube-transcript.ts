import { execSync } from "child_process";
import { readFileSync, unlinkSync, existsSync, readdirSync } from "fs";
import { join, basename } from "path";
import { tmpdir } from "os";
import { createChildLogger } from "../utils/logger.js";
import type { ExtractionResult } from "./article-extractor.js";

const log = createChildLogger("youtube-transcript");

const MAX_TRANSCRIPT_LENGTH = 15000;

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
      log.info({ videoId, length: content.length }, "yt-dlp 자막 추출 성공");
      return { url, content, wordCount: content.split(/\s+/).length, status: "success" };
    }
    log.warn({ videoId }, "yt-dlp: SRT 파일 없음 — 폴백");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn({ videoId, error: message }, "yt-dlp 실패 — 라이브러리 폴백");
  }

  // yt-dlp 실패 시 기존 라이브러리 폴백
  return fallbackToLibrary(url, videoId);
}

function extractWithYtDlp(videoId: string): string {
  const tmpFile = join(tmpdir(), `dev-digest-yt-${videoId}`);
  const prefix = basename(tmpFile);
  const dir = tmpdir();

  try {
    // 자막 + 자동 생성 자막 모두 시도, 다국어 지원
    execSync(
      `yt-dlp --write-subs --write-auto-sub --sub-lang "en.*,en,ko.*,ko,ja.*,ja" --sub-format srt --skip-download --no-warnings --output "${tmpFile}" "https://www.youtube.com/watch?v=${videoId}"`,
      { timeout: 30000, stdio: "pipe" }
    );

    // 다운로드된 SRT 파일을 패턴으로 찾기 (언어 코드가 다양할 수 있음)
    const srtFiles = readdirSync(dir)
      .filter((f) => f.startsWith(prefix) && f.endsWith(".srt"))
      .map((f) => join(dir, f))
      .sort((a, b) => {
        // 수동 자막(orig 없는) 우선, 영어 우선
        const aName = basename(a);
        const bName = basename(b);
        const aIsOrig = aName.includes("-orig");
        const bIsOrig = bName.includes("-orig");
        if (!aIsOrig && bIsOrig) return -1;
        if (aIsOrig && !bIsOrig) return 1;
        const aIsEn = aName.includes(".en");
        const bIsEn = bName.includes(".en");
        if (aIsEn && !bIsEn) return -1;
        if (!aIsEn && bIsEn) return 1;
        return 0;
      });

    if (srtFiles.length === 0) return "";

    log.debug({ videoId, srtFiles: srtFiles.map(basename) }, "SRT 파일 발견");

    const srt = readFileSync(srtFiles[0], "utf-8");
    return parseSrt(srt);
  } finally {
    // 임시 SRT 파일 모두 정리
    try {
      const files = readdirSync(dir).filter(
        (f) => f.startsWith(prefix) && f.endsWith(".srt")
      );
      for (const f of files) {
        try { unlinkSync(join(dir, f)); } catch {}
      }
    } catch {}
  }
}

function parseSrt(srt: string): string {
  // HTML 태그 제거 (자동 자막에 <font> 등 포함)
  const cleaned = srt.replace(/<[^>]+>/g, "");

  const lines = cleaned.split("\n");
  const textLines: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^\d+$/.test(trimmed)) continue;              // 시퀀스 번호
    if (/^\d{2}:\d{2}/.test(trimmed)) continue;       // 타임스탬프

    // 자동 자막 중복 라인 제거
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      textLines.push(trimmed);
    }
  }

  return textLines
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

    for (const lang of ["en", "ko", undefined]) {
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
      log.warn({ videoId }, "폴백 라이브러리: 자막 없음");
      return { url, content: "", wordCount: 0, status: "failed", error: "No transcript available" };
    }

    const content = segments
      .map((s) => s.text.trim())
      .filter((t) => t.length > 0)
      .join(" ")
      .replace(/\s{2,}/g, " ")
      .slice(0, MAX_TRANSCRIPT_LENGTH);

    log.info({ videoId, length: content.length }, "폴백 라이브러리 자막 추출 성공");
    return { url, content, wordCount: content.split(/\s+/).length, status: "success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn({ videoId, error: message }, "폴백 라이브러리도 실패");
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
