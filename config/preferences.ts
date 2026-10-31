import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

/**
 * 운영자 개인화 설정(config/preferences.json). AI 분류 전에 적용된다.
 * 기본값(빈 키워드, 후보 50건, 소스 상한 없음)은 개인화 도입 전 동작과 같다.
 */

const MAX_KEYWORDS = 100;

const keywordList = z
  .array(z.string().trim().max(100))
  .max(MAX_KEYWORDS)
  .default([])
  .transform((values) => {
    // 빈 값과 대소문자만 다른 중복을 지운다(처음 쓴 표기 유지)
    const unique = new Map<string, string>();
    for (const value of values) {
      const key = value.toLowerCase();
      if (value && !unique.has(key)) unique.set(key, value);
    }
    return [...unique.values()];
  });

const preferencesSchema = z
  .object({
    /** 제목·요약·태그에 있으면 점수를 더한다 */
    preferredKeywords: keywordList,
    /** 제목·요약·태그에 있으면 후보에서 뺀다 */
    excludedKeywords: keywordList,
    /** config/sources 의 source id */
    excludedSourceIds: z.array(z.string().trim().min(1).max(100)).max(200).default([]),
    /** AI 분류로 넘길 후보 수 */
    maxCandidates: z.number().int().min(1).max(200).default(50),
    /** 한 소스에서 후보로 넘길 최대 수. 없으면 제한하지 않는다 */
    maxPerSource: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type DigestPreferences = z.infer<typeof preferencesSchema>;

export function parseDigestPreferences(input: unknown): DigestPreferences {
  return preferencesSchema.parse(input);
}

/** 호출 시점에 파일을 읽는다. 잘못된 설정은 기본값으로 숨기지 않고 실패시킨다 */
export function getDigestPreferences(): DigestPreferences {
  const path =
    process.env.DIGEST_PREFERENCES_PATH?.trim() || fileURLToPath(new URL("./preferences.json", import.meta.url));
  try {
    return parseDigestPreferences(JSON.parse(readFileSync(path, "utf8")));
  } catch (cause) {
    throw new Error(`개인화 설정을 읽을 수 없습니다: ${path}`, { cause });
  }
}
