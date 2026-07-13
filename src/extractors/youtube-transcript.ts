import { execSync } from "child_process";
import { readFileSync, unlinkSync, existsSync, readdirSync } from "fs";
import { join, basename } from "path";
import { tmpdir } from "os";
import { createChildLogger } from "../utils/logger.js";
import type { ExtractionResult } from "./article-extractor.js";

const log = createChildLogger("youtube-transcript");

const MAX_TRANSCRIPT_LENGTH = 15000;

// 동시 yt-dlp 실행이 YouTube 자막 엔드포인트 429 를 유발해 영상 추출만 직렬화.
// enricher 의 concurrency 3 은 기사 추출에는 그대로 유효하다.
let ytQueue: Promise<unknown> = Promise.resolve();

export async function extractYoutubeTranscript(url: string): Promise<ExtractionResult> {
  const videoId = parseVideoId(url);
  if (!videoId) {
    return { url, content: "", wordCount: 0, status: "failed", error: "Invalid YouTube URL" };
  }

  // CI(데이터센터 IP)는 유튜브에 ASN 봇차단당해 yt-dlp/라이브러리가 전부 실패한다.
  // 매니지드 API(Supadata)가 깨끗한 IP로 대신 긁어오는 게 CI에서 유일하게 동작하는 경로.
  // 키 없으면(로컬, 레지던셜 IP) 기존 yt-dlp 로 폴백.
  if (process.env.SUPADATA_API_KEY) {
    const viaApi = await fetchTranscriptViaApi(url, videoId);
    if (viaApi.status === "success") return viaApi;
    // API 실패 시에도 아래 yt-dlp 를 시도 (로컬/일시장애 대비)
    log.warn({ videoId }, "Supadata 실패 — yt-dlp 폴백(CI 는 봇차단으로 실패 가능)");
  } else {
    // 키 없으면 CI 에선 yt-dlp/라이브러리가 전부 봇차단당해 자막 0바이트가 된다.
    // 조용히 실패하지 않도록 명시 로깅 — "왜 또 제목만 나오지"를 로그로 바로 확인.
    log.warn({ videoId }, "SUPADATA_API_KEY 미설정 — 영상 자막 API 건너뜀(yt-dlp 폴백)");
  }

  // yt-dlp 사용 가능 여부 확인
  if (!isYtDlpAvailable()) {
    return fallbackToLibrary(url, videoId);
  }

  const run = ytQueue.then(() => extractSerialized(url, videoId));
  ytQueue = run.then(() => undefined, () => undefined);
  return run;
}

// Supadata 트랜스크립트 API — 자막 없는 영상도 AI 로 생성해준다(caption-less shorts 커버).
// 스펙: GET /v1/youtube/transcript?url=<url>&text=true , 헤더 x-api-key
//       응답 { content, lang, availableLangs }
async function fetchTranscriptViaApi(url: string, videoId: string): Promise<ExtractionResult> {
  try {
    // /v1/transcript = 현재 정식(범용) 엔드포인트. 구 /v1/youtube/transcript 는 deprecated.
    const endpoint = `https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(
      url
    )}&text=true`;
    const res = await fetch(endpoint, {
      headers: { "x-api-key": process.env.SUPADATA_API_KEY! },
    });
    if (res.status === 202) {
      // ponytail: 20분 초과 영상은 202+jobId 비동기 처리. 폴링 미구현 —
      // 장영상 자막이 실제로 필요해지면 GET /v1/transcript/{jobId} 폴링 추가.
      log.warn({ videoId }, "Supadata: 장영상 비동기(202) — 미지원, 폴백");
      return { url, content: "", wordCount: 0, status: "failed", error: "async 202" };
    }
    if (!res.ok) {
      log.warn({ videoId, status: res.status }, "Supadata 자막 API 실패");
      return { url, content: "", wordCount: 0, status: "failed", error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { content?: string };
    const content = (data.content ?? "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, MAX_TRANSCRIPT_LENGTH);
    if (content.length === 0) {
      return { url, content: "", wordCount: 0, status: "failed", error: "empty" };
    }
    log.info({ videoId, length: content.length }, "Supadata 자막 추출 성공");
    return { url, content, wordCount: content.split(/\s+/).length, status: "success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn({ videoId, error: message }, "Supadata 자막 API 예외");
    return { url, content: "", wordCount: 0, status: "failed", error: message };
  }
}

async function extractSerialized(url: string, videoId: string): Promise<ExtractionResult> {
  const content = extractWithYtDlp(videoId);
  if (content.length > 0) {
    log.info({ videoId, length: content.length }, "yt-dlp 자막 추출 성공");
    return { url, content, wordCount: content.split(/\s+/).length, status: "success" };
  }
  log.warn({ videoId }, "yt-dlp: SRT 파일 없음 — 폴백");
  return fallbackToLibrary(url, videoId);
}

function extractWithYtDlp(videoId: string): string {
  const tmpFile = join(tmpdir(), `dev-digest-yt-${videoId}`);
  const prefix = basename(tmpFile);
  const dir = tmpdir();

  // CI(데이터센터 IP)는 봇차단을 자주 당함 — YT_COOKIES_FILE 시크릿이 있으면 로그인 쿠키로 우회
  const cookiesFile = process.env.YT_COOKIES_FILE;
  const cookiesArg = cookiesFile && existsSync(cookiesFile) ? ` --cookies "${cookiesFile}"` : "";

  try {
    // 자막 + 자동 생성 자막 모두 시도. 언어는 en,ko 만 — 패턴이 많을수록
    // 자막 요청 수가 늘어 429 로 이어진다.
    try {
      execSync(
        `yt-dlp --write-subs --write-auto-sub --sub-lang "en,ko" --sub-format srt --sleep-requests 1 --skip-download --no-warnings${cookiesArg} --output "${tmpFile}" "https://www.youtube.com/watch?v=${videoId}"`,
        { timeout: 60000, stdio: "pipe" }
      );
    } catch (error) {
      // 일부 언어만 429 등으로 실패해도 yt-dlp 는 비정상 종료한다.
      // 이미 다운로드된 SRT 는 유효하므로 버리지 않고 아래에서 스캔한다.
      const message = error instanceof Error ? error.message : String(error);
      log.warn({ videoId, error: message.slice(0, 300) }, "yt-dlp 비정상 종료 — 받아둔 SRT 스캔 계속");
    }

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

    log.debug({ videoId, srtFiles: srtFiles.map((f) => basename(f)) }, "SRT 파일 발견");

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
