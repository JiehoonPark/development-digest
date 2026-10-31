import type { ArchiveItem } from "@/shared/config";

/**
 * 같은 토픽 클러스터의 비주요(secondary) 기사인지.
 * 목록·건수에서는 제외하고, 주요 기사의 "관련 N건" 배지로만 노출한다.
 */
export function isRelatedClusterItem(item: Pick<ArchiveItem, "topicId" | "isTopicPrimary">): boolean {
  return Boolean(item.topicId && !item.isTopicPrimary);
}
