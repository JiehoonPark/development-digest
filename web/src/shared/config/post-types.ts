/**
 * 하루 1편 심층 글(Post) 데이터 계약. 파이프라인이 `data/posts/{slug}.json` 으로 쓰고 웹이 빌드타임에 읽는다.
 */

export interface PostCover {
  /** 사이트 루트 기준 경로(`/covers/...`) 또는 절대 URL */
  src: string;
  alt: string;
  /** 파이프라인이 고른 커버 형식(화면에서는 쓰지 않음) */
  style?: string;
  /**
   * 움직이는 커버용 두 판. 그림 판(art, 글자 없음)만 천천히 움직이고 글자 판(text, 투명 바탕)은 고정한다.
   * 없으면 src 한 장을 그대로 보여 준다.
   */
  layers?: { art: string; text: string; motion?: string };
}

/** 본문에서 `[n]` 으로 인용하는 원문 */
export interface PostSource {
  id: number;
  title: string;
  publisher: string;
  url: string;
  /** 원문 발행일 (YYYY-MM-DD) */
  publishedAt?: string;
  /** 원문이 제공하는 대표 이미지(og:image) */
  image?: string;
}

/** 깊게 다루지 않은 그날의 짧은 소식 */
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
  /** 제목 아래 1~2문장 소개 */
  dek: string;
  tags: string[];
  readingMinutes: number;
  cover?: PostCover;
  /** 요약 상자 항목. 인라인 마크다운과 `[n]` 인용 허용 */
  tldr: string[];
  /** 본문 마크다운 (GFM 표·코드·이미지·인용 허용) */
  body: string;
  /** "해 볼 것" 목록 */
  actions?: string[];
  sources: PostSource[];
  briefs?: PostBrief[];
  /**
   * 글의 출발점. 없으면 "source" — 그날 다이제스트 기사 하나([1])에서 출발해 여러 자료로 다시 쓴 글.
   * "topic" 은 기사 없이 주제를 정해 공식 문서로 쓴 글(FSD·모노레포 등)이라 [1] 을 출발점으로 표시하지 않는다.
   */
  origin?: "source" | "topic";
}
