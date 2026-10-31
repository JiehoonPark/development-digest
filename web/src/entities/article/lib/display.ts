import type { ArchiveItem } from "@/shared/config";

export { isRelatedClusterItem } from "@/shared/lib";

export function getDisplayTitle(item: ArchiveItem): string {
  return item.titleKo ?? item.title;
}
