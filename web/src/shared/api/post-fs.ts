/**
 * 빌드타임 전용. `web/` cwd 기준 `../data/posts/*.json` 을 읽는다.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import type { PostData } from "@/shared/config";

const POSTS_DIR = resolve(process.cwd(), "..", "data", "posts");

export function loadAllPosts(): PostData[] {
  if (!existsSync(POSTS_DIR)) return [];

  const posts: PostData[] = [];
  for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".json"))) {
    try {
      posts.push(JSON.parse(readFileSync(join(POSTS_DIR, file), "utf8")) as PostData);
    } catch {
      // 손상된 JSON 은 건너뛴다 — 한 편 때문에 사이트 빌드 전체를 막지 않는다
    }
  }
  return posts;
}
