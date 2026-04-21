/**
 * Archive entity API. Server Component에서만 호출되며 빌드타임에 파일시스템을 읽는다.
 * 실제 fs 접근은 `shared/api`에 위임 — entity는 도메인 의미(최신, 날짜별 등)만 책임.
 */
import { loadAllArchives, loadArchiveByDate, loadLatestArchive } from "@/shared/api";
import type { ArchiveData } from "@/shared/config";

export function listArchives(): ArchiveData[] {
  return loadAllArchives().sort((a, b) => b.date.localeCompare(a.date));
}

export function getArchive(date: string): ArchiveData | null {
  return loadArchiveByDate(date);
}

export function getLatestArchive(): ArchiveData | null {
  return loadLatestArchive();
}

export function countArchiveItems(archive: ArchiveData): number {
  return archive.sections.reduce((acc, s) => acc + s.items.length, 0);
}
