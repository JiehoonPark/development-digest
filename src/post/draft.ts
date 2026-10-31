/** 작성 모델이 태그 형식으로 낸 초안 */
export interface PostDraft {
  slug: string;
  title: string;
  dek: string;
  tags: string[];
  tldr: string[];
  body: string;
  actions: string[];
  /** 커버 재료 JSON 원문 — cover/cover-spec.ts 가 검증한다 */
  coverSpec: string;
  coverAlt: string;
}

const REQUIRED_TAGS = ["slug", "title", "dek", "tags", "tldr", "body", "actions"] as const;
const MAX_SLUG_WORDS = 6;

function readTag(raw: string, tag: string): string | undefined {
  // 본문 마크다운 안에 같은 태그 문자열이 있을 수 있어 마지막 닫는 태그까지 읽는다
  const open = raw.indexOf(`<${tag}>`);
  const close = raw.lastIndexOf(`</${tag}>`);
  if (open === -1 || close === -1 || close < open) return undefined;
  return raw.slice(open + tag.length + 2, close).trim();
}

function readList(block: string): string[] {
  return block
    .split("\n")
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter(Boolean);
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, MAX_SLUG_WORDS)
    .join("-");
}

export function parseDraft(raw: string): PostDraft {
  const missing = REQUIRED_TAGS.filter((tag) => !readTag(raw, tag));
  if (missing.length > 0) {
    throw new Error(`초안 형식 오류 — 빠진 태그: ${missing.join(", ")}`);
  }

  const slug = toSlug(readTag(raw, "slug")!);
  if (!slug) throw new Error("초안 형식 오류 — slug 가 비었습니다");

  return {
    slug,
    title: readTag(raw, "title")!,
    dek: readTag(raw, "dek")!,
    tags: readTag(raw, "tags")!
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 3),
    tldr: readList(readTag(raw, "tldr")!),
    body: readTag(raw, "body")!,
    actions: readList(readTag(raw, "actions")!),
    coverSpec: readTag(raw, "cover") ?? "",
    coverAlt: readTag(raw, "coverAlt") ?? "",
  };
}

/** 수정 요청 때 모델에게 다시 보여줄 원래 형식 */
export function serializeDraft(draft: PostDraft): string {
  return [
    `<slug>${draft.slug}</slug>`,
    `<title>${draft.title}</title>`,
    `<dek>${draft.dek}</dek>`,
    `<tags>${draft.tags.join(", ")}</tags>`,
    `<tldr>\n${draft.tldr.map((line) => `- ${line}`).join("\n")}\n</tldr>`,
    `<body>\n${draft.body}\n</body>`,
    `<actions>\n${draft.actions.map((line) => `- ${line}`).join("\n")}\n</actions>`,
    `<cover>${draft.coverSpec}</cover>`,
    `<coverAlt>${draft.coverAlt}</coverAlt>`,
  ].join("\n");
}

/** 한국어 기술 글 기준 분당 약 500자. 코드는 읽는 속도가 느려 두 배로 센다 */
export function estimateReadingMinutes(body: string): number {
  const CHARS_PER_MINUTE = 500;
  const codeChars = (body.match(/```[\s\S]*?```/g) ?? []).join("").length;
  const weighted = body.length + codeChars;
  return Math.max(1, Math.round(weighted / CHARS_PER_MINUTE));
}
