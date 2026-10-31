/**
 * 하루 1편 심층 글(Post) 데이터 계약.
 * 웹(`web/src/shared/config/post-types.ts`)과 같은 모양이어야 한다 — 파이프라인 tsconfig 가 web/ 을 포함하지 않아 복제해 둔다.
 * 필드를 바꾸면 두 파일을 함께 고친다.
 */

export interface PostCover {
  /** 사이트 루트 기준 경로(`/covers/...`) */
  src: string;
  alt: string;
  /** 커버 형식(code·compare·stat·logos·typography·pop·logo-glow) — 다음 글이 같은 형식을 피하는 데 쓴다 */
  style?: string;
}

export interface PostSource {
  id: number;
  title: string;
  publisher: string;
  url: string;
  /** 원문 발행일 (YYYY-MM-DD) */
  publishedAt?: string;
  image?: string;
}

export interface PostBrief {
  label: string;
  title: string;
  note: string;
  sourceId: number;
}

export interface PostData {
  slug: string;
  /** 발행일 (YYYY-MM-DD, KST) */
  date: string;
  title: string;
  dek: string;
  tags: string[];
  readingMinutes: number;
  cover?: PostCover;
  tldr: string[];
  body: string;
  actions?: string[];
  sources: PostSource[];
  briefs?: PostBrief[];
}

/** 글감 후보 — 분류·본문 추출을 마친 수집 항목에서 필요한 것만 */
export interface PostCandidate {
  url: string;
  title: string;
  titleKo?: string;
  sourceName: string;
  publishedAt?: string;
  contentType: string;
  labels: string[];
  relevance: number;
  summary?: string;
  fullContent?: string;
}

/** 본문 작성에 넘기는 근거 자료. id 는 본문의 `[n]` 번호 */
export interface ResearchSource {
  id: number;
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  /** 추출한 원문 텍스트 — 작성·검증 모델이 이것만 근거로 쓴다 */
  content: string;
}
