import pMap from "p-map";
import type { ArchiveData, ArchiveItem } from "../data/digest-archiver.js";
import { askClaude } from "../summarizer/claude-summarizer.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("translator");

const CONCURRENCY = 3;
const MAX_CONTENT_LENGTH = 12000;

const TRANSLATE_PROMPT = `당신은 한국의 시니어 프론트엔드 개발자이자 기술 블로거입니다.
아래 영문 기술 아티클을 한국어 독자가 읽기 편한 글로 재구성하세요.

당신의 목표는 "번역체"가 아닌, 처음부터 한국어로 쓴 것 같은 자연스러운 기술 글을 만드는 것입니다.

작성 원칙:
- 직역하지 마세요. 원문의 의미를 이해한 뒤, 한국어 독자에게 자연스러운 어순과 표현으로 다시 써주세요.
- "~하는 것은 ~합니다" 같은 번역투 문장을 피하고, "~해보겠습니다", "~인데요", "~거든요" 같은 자연스러운 구어체를 사용하세요.
- 불필요하게 긴 문장은 두 문장으로 나누세요.
- 원문에 없더라도 문맥상 자연스러운 연결어(예: "그런데", "즉", "다시 말해")를 추가해도 됩니다.
- 원문의 핵심 내용과 구조(섹션, 코드 블록, 목록)는 유지하되, 문단 순서나 흐름은 한국어 독자에게 맞게 조정해도 됩니다.

기술 용어 처리:
- React, TypeScript, DOM, SSR 등 고유명사는 영문 그대로 유지
- "rendering" → "렌더링", "component" → "컴포넌트"처럼 이미 정착된 외래어는 한국어로
- 코드 블록은 절대 번역하지 않고 원문 그대로 유지

결과물만 출력하세요 (부가 설명, 메타 코멘트 없이).`;

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
