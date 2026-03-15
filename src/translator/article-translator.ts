import pMap from "p-map";
import type { ArchiveData, ArchiveItem } from "../data/digest-archiver.js";
import { askClaude } from "../summarizer/claude-summarizer.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("translator");

const CONCURRENCY = 3;
const MAX_CONTENT_LENGTH = 12000;

const TRANSLATE_PROMPT = `당신은 프론트엔드 개발 기술 문서 전문 번역가입니다.
다음 영문 기술 아티클을 자연스러운 한국어로 번역하세요.

규칙:
- 기술 용어(React, TypeScript, API 등)는 영문 그대로 유지
- 코드 블록은 번역하지 않고 원문 유지
- 자연스러운 한국어 문장으로 번역 (직역 지양)
- 원문의 구조(제목, 단락, 목록)를 유지
- 번역문만 출력 (부가 설명 없이)`;

export async function translateArticles(archive: ArchiveData): Promise<ArchiveData> {
  if (process.env.SKIP_TRANSLATION === "true") {
    log.info("번역 건너뜀 (SKIP_TRANSLATION=true)");
    return archive;
  }

  const itemsToTranslate: Array<{ sectionIdx: number; itemIdx: number; item: ArchiveItem }> = [];

  for (let si = 0; si < archive.sections.length; si++) {
    for (let ii = 0; ii < archive.sections[si].items.length; ii++) {
      const item = archive.sections[si].items[ii];
      if (item.fullContent && item.language !== "ko") {
        itemsToTranslate.push({ sectionIdx: si, itemIdx: ii, item });
      }
    }
  }

  if (itemsToTranslate.length === 0) {
    log.info("번역할 아이템 없음");
    return archive;
  }

  log.info({ count: itemsToTranslate.length }, "번역 시작");

  const results = await pMap(
    itemsToTranslate,
    async ({ sectionIdx, itemIdx, item }) => {
      try {
        const content = item.fullContent!.slice(0, MAX_CONTENT_LENGTH);
        const translated = await askClaude(TRANSLATE_PROMPT, content);
        log.info({ title: item.title.slice(0, 40) }, "번역 완료");
        return { sectionIdx, itemIdx, translated };
      } catch (error) {
        log.warn({ title: item.title, error }, "번역 실패 — 건너뜀");
        return { sectionIdx, itemIdx, translated: null };
      }
    },
    { concurrency: CONCURRENCY }
  );

  const updated = structuredClone(archive);
  for (const { sectionIdx, itemIdx, translated } of results) {
    if (translated) {
      updated.sections[sectionIdx].items[itemIdx].translatedContent = translated;
    }
  }

  const successCount = results.filter((r) => r.translated).length;
  log.info({ total: itemsToTranslate.length, success: successCount }, "번역 완료");

  return updated;
}
