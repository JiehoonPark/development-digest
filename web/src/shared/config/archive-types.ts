/**
 * 파이프라인(`src/data/digest-archiver.ts`)이 쓰는 JSON 스키마의 거울.
 * 타입을 여기 복제해두면 web/ 가 src/ 의 런타임 코드에 결합되지 않는다 (경계 유지).
 * 스키마가 바뀌면 이 파일과 `src/summarizer/batch-processor.ts` 둘 다 업데이트할 것.
 */

export type CategoryKey = "hot" | "tech" | "insight" | "video";

export interface ArchiveItem {
  title: string;
  titleKo?: string;
  url: string;
  sourceName: string;
  summary: string;
  keyPoints: string[];
  whyItMatters?: string;
  engagement?: number;
  contentType: string;
  labels?: string[];
  topicId?: string;
  isTopicPrimary?: boolean;
  relatedCount?: number;

  slug: string;
  fullContent?: string;
  translatedContent?: string;
  category: string;
  publishedAt?: string;
  language?: string;
  tags?: string[];
}

export interface ArchiveSection {
  category: string;
  items: ArchiveItem[];
}

export interface ArchiveData {
  date: string;
  intro: string;
  sections: ArchiveSection[];
}
