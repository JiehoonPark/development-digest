import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { createChildLogger } from "../utils/logger.js";
import { getCoversDir } from "./post-store.js";
import { buildCoverPrompt } from "./prompts.js";
import type { PostCover } from "./types.js";

const log = createChildLogger("post-cover");

const IMAGE_MODEL = process.env.POST_COVER_MODEL ?? "gpt-image-2";
const IMAGE_SIZE = "1536x1024";
const IMAGE_QUALITY = "medium";
const JPEG_COMPRESSION = 74;
const REQUEST_TIMEOUT_MS = 180_000;

/**
 * 커버를 만들어 `web/public/covers/{slug}.jpg` 로 저장한다.
 * 커버는 장식이라 실패해도 글은 발행한다 — 웹은 커버가 없으면 같은 비율의 빈 면을 그린다.
 */
export async function generateCover(slug: string, scene: string, alt: string): Promise<PostCover | undefined> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log.warn("OPENAI_API_KEY 없음 — 커버 없이 발행");
    return undefined;
  }
  if (!scene) {
    log.warn("커버 장면 설명 없음 — 커버 없이 발행");
    return undefined;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: buildCoverPrompt(scene),
        size: IMAGE_SIZE,
        quality: IMAGE_QUALITY,
        output_format: "jpeg",
        output_compression: JPEG_COMPRESSION,
        n: 1,
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
    }

    const data = (await res.json()) as { data?: Array<{ b64_json?: string }> };
    const base64 = data.data?.[0]?.b64_json;
    if (!base64) throw new Error("응답에 이미지가 없습니다");

    const dir = getCoversDir();
    mkdirSync(dir, { recursive: true });
    const fileName = `${slug}.jpg`;
    writeFileSync(join(dir, fileName), Buffer.from(base64, "base64"));
    log.info({ fileName, model: IMAGE_MODEL }, "커버 생성 완료");

    return { src: `/covers/${fileName}`, alt };
  } catch (error) {
    log.warn({ error: (error as Error).message }, "커버 생성 실패 — 커버 없이 발행");
    return undefined;
  }
}
