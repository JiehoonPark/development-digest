import type { ArchiveItem } from "@/shared/config";

export function getDisplayTitle(item: ArchiveItem): string {
  return item.titleKo ?? item.title;
}

export function isRelatedClusterItem(item: ArchiveItem): boolean {
  return Boolean(item.topicId && !item.isTopicPrimary);
}
