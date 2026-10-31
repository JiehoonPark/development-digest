import { isKnownLogo } from "./logos.js";

/**
 * 커버 형식. 글마다 같은 느낌이 반복되지 않도록 여러 형식을 돌려 쓰고,
 * 재료가 맞는 형식이 없을 때만 기본형(logo-glow)을 쓴다.
 */
export const COVER_STYLES = ["code", "compare", "stat", "logos", "typography", "logo-glow"] as const;
export type CoverStyle = (typeof COVER_STYLES)[number];

export const FALLBACK_STYLE: CoverStyle = "logo-glow";

/** 작성 모델이 글에서 뽑아 주는 커버 재료. 해당하는 것만 채운다 */
export interface CoverSpec {
  /** 등장 기술 로고 이름(logos.ts 의 키). 첫 번째가 주인공 */
  logos: string[];
  /** 로고 위에 얹는 짧은 키워드(코드·API 이름 등) */
  keyword: string;
  /** 큰 타이포용 문구 */
  headline: string;
  /** 대표 코드 조각 */
  code: string;
  /** 코드 창 파일 이름 */
  codeFile: string;
  /** 바뀌기 전/후 */
  before: string;
  after: string;
  /** 큰 숫자(예: 5.5×, 90%)와 설명 */
  stat: string;
  statLabel: string;
}

const LIMITS = {
  keyword: 32,
  headline: 36,
  codeLines: { min: 2, max: 9 },
  codeLineLength: 56,
  compareSide: 34,
  stat: 8,
  statLabel: 40,
  logos: 3,
} as const;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** 모델 출력(JSON)을 검증해 쓸 수 있는 값만 남긴다. 실패해도 빈 재료로 돌려 기본형이 되게 한다 */
export function parseCoverSpec(raw: string, fallbackKeyword: string): CoverSpec {
  let input: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") input = parsed as Record<string, unknown>;
  } catch {
    // 형식이 깨졌으면 기본형
  }

  const logos = (Array.isArray(input.logos) ? input.logos : [])
    .map((name) => text(name).toLowerCase())
    .filter(isKnownLogo)
    .filter((name, index, all) => all.indexOf(name) === index)
    .slice(0, LIMITS.logos);

  const keyword = text(input.keyword);
  return {
    logos,
    keyword: keyword && keyword.length <= LIMITS.keyword ? keyword : fallbackKeyword.slice(0, LIMITS.keyword),
    headline: text(input.headline),
    code: typeof input.code === "string" ? input.code.replace(/\s+$/, "") : "",
    codeFile: text(input.codeFile),
    before: text(input.before),
    after: text(input.after),
    stat: text(input.stat),
    statLabel: text(input.statLabel),
  };
}

const isCodeUsable = (spec: CoverSpec) => {
  const lines = spec.code.split("\n");
  return (
    lines.length >= LIMITS.codeLines.min &&
    lines.length <= LIMITS.codeLines.max &&
    lines.every((line) => line.length <= LIMITS.codeLineLength)
  );
};
const isCompareUsable = (spec: CoverSpec) =>
  Boolean(spec.before && spec.after) &&
  spec.before.length <= LIMITS.compareSide &&
  spec.after.length <= LIMITS.compareSide;
const isStatUsable = (spec: CoverSpec) =>
  Boolean(spec.stat && spec.statLabel) && spec.stat.length <= LIMITS.stat && spec.statLabel.length <= LIMITS.statLabel;
const isLogosUsable = (spec: CoverSpec) => spec.logos.length >= 2;
const isTypographyUsable = (spec: CoverSpec) => Boolean(spec.headline) && spec.headline.length <= LIMITS.headline;

/** 재료가 갖춰진 형식(기본형 제외) */
export function usableStyles(spec: CoverSpec): CoverStyle[] {
  const checks: Array<[CoverStyle, boolean]> = [
    ["code", isCodeUsable(spec)],
    ["compare", isCompareUsable(spec)],
    ["stat", isStatUsable(spec)],
    ["logos", isLogosUsable(spec)],
    ["typography", isTypographyUsable(spec)],
  ];
  return checks.filter(([, ok]) => ok).map(([style]) => style);
}

/**
 * 쓸 수 있는 형식 중 최근에 가장 오래 안 쓴 것을 고른다(같은 형식이 연달아 나오지 않게).
 * recentStyles 는 최신 글부터. 쓸 수 있는 형식이 없으면 기본형.
 */
export function chooseCoverStyle(spec: CoverSpec, recentStyles: string[]): CoverStyle {
  const candidates = usableStyles(spec);
  if (candidates.length === 0) return FALLBACK_STYLE;

  const lastUsedAt = (style: CoverStyle) => {
    const index = recentStyles.indexOf(style);
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  };
  // 오래 안 쓴 순, 같으면 COVER_STYLES 순서(글 내용에 더 밀착한 형식 우선)
  return [...candidates].sort((a, b) => lastUsedAt(b) - lastUsedAt(a))[0];
}
