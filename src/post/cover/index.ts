import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { createChildLogger } from "../../utils/logger.js";
import { getCoversDir } from "../post-store.js";
import type { PostCover } from "../types.js";
import { chooseCoverStyle, type CoverSpec, type CoverStyle } from "./cover-spec.js";
import { renderHtmlToJpeg } from "./render.js";
import { renderCoverHtml } from "./templates.js";

export { parseCoverSpec, chooseCoverStyle, COVER_STYLES } from "./cover-spec.js";
export type { CoverSpec, CoverStyle } from "./cover-spec.js";
export { LOGO_NAMES } from "./logos.js";

const log = createChildLogger("post-cover");

/**
 * 커버를 템플릿으로 그려 `web/public/covers/{slug}.jpg` 에 저장한다(이미지 생성 AI 없음).
 * 형식은 최근 글과 겹치지 않게 고르고, 재료가 맞는 형식이 없으면 로고+빛 기본형.
 * 커버는 장식이라 실패해도 글은 발행한다.
 */
export async function generateCover(
  slug: string,
  spec: CoverSpec,
  alt: string,
  recentStyles: string[]
): Promise<PostCover | undefined> {
  const style: CoverStyle = chooseCoverStyle(spec, recentStyles);
  try {
    const image = await renderHtmlToJpeg(renderCoverHtml(style, spec));
    const dir = getCoversDir();
    mkdirSync(dir, { recursive: true });
    const fileName = `${slug}.jpg`;
    writeFileSync(join(dir, fileName), image);
    log.info({ fileName, style, logos: spec.logos }, "커버 생성 완료");
    return { src: `/covers/${fileName}`, alt, style };
  } catch (error) {
    log.warn({ error: (error as Error).message, style }, "커버 생성 실패 — 커버 없이 발행");
    return undefined;
  }
}
