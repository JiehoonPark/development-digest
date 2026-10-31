import { loadAllPosts } from "@/shared/api";
import type { PostData } from "@/shared/config";

/** 최신 발행일 순 */
export function listPosts(): PostData[] {
  return loadAllPosts().sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): PostData | null {
  return loadAllPosts().find((post) => post.slug === slug) ?? null;
}
