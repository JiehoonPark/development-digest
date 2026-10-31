import type { ArchiveData, ArchiveItem } from "@/shared/config";
import { isRelatedClusterItem } from "@/shared/lib";

const SECTION_ORDER: Record<string, number> = { hot: 0, tech: 1, insight: 2, video: 3 };
const UNKNOWN_SECTION_ORDER = 99;

/**
 * 화면에 실제로 보이는 기사 목록. 섹션 구분 없이 hot → tech → insight → video 순으로 평탄화하고
 * 클러스터 비주요 기사는 제외한다(주요 기사의 "관련 N건" 배지로 대체, 이메일과 동일).
 */
export function listVisibleItems(archive: ArchiveData): ArchiveItem[] {
  const sections = [...archive.sections].sort(
    (a, b) =>
      (SECTION_ORDER[a.category] ?? UNKNOWN_SECTION_ORDER) -
      (SECTION_ORDER[b.category] ?? UNKNOWN_SECTION_ORDER)
  );
  return sections.flatMap((s) => s.items).filter((item) => !isRelatedClusterItem(item));
}

/** 목록·상세 페이지 상단과 아카이브 표에 표시하는 건수. 반드시 listVisibleItems 와 같은 기준이어야 한다. */
export function countArchiveItems(archive: ArchiveData): number {
  return listVisibleItems(archive).length;
}
