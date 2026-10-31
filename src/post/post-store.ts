import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { PostData } from "./types.js";
import { daysBetween } from "./kst-date.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../..");

/** DRY_RUN 은 운영 글 목록을 건드리지 않도록 data/preview 아래에 쓴다 */
function isDryRun(): boolean {
  return process.env.DRY_RUN === "true";
}

/** 호출 시점에 읽는다 — 테스트와 미리보기가 POST_DATA_DIR 로 경로를 바꿀 수 있게 */
export function getPostsDir(): string {
  if (process.env.POST_DATA_DIR) return process.env.POST_DATA_DIR;
  return join(REPO_ROOT, isDryRun() ? "data/preview/posts" : "data/posts");
}

export function getCoversDir(): string {
  if (process.env.POST_COVER_DIR) return process.env.POST_COVER_DIR;
  return join(REPO_ROOT, isDryRun() ? "data/preview/covers" : "web/public/covers");
}

/**
 * 이미 발행된 글. DRY_RUN 이어도 운영 글을 읽어야 주제 중복·재사용 원문 판단이 실제와 같아진다.
 */
export function loadPublishedPosts(): PostData[] {
  return readPostsFrom(process.env.POST_DATA_DIR ?? join(REPO_ROOT, "data/posts"));
}

/** 이번 실행이 쓰는 위치의 글(DRY_RUN 이면 미리보기) */
export function loadPosts(): PostData[] {
  return readPostsFrom(getPostsDir());
}

function readPostsFrom(dir: string): PostData[] {
  if (!existsSync(dir)) return [];

  const posts: PostData[] = [];
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
    try {
      posts.push(JSON.parse(readFileSync(join(dir, file), "utf8")) as PostData);
    } catch {
      // 손상된 한 편 때문에 오늘 발행을 막지 않는다
    }
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function loadRecentPosts(today: string, withinDays: number): PostData[] {
  return loadPublishedPosts().filter((post) => daysBetween(post.date, today) <= withinDays);
}

export function hasPostForDate(date: string): boolean {
  return loadPosts().some((post) => post.date === date);
}

export function savePost(post: PostData): string {
  const dir = getPostsDir();
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${post.slug}.json`);
  if (existsSync(path)) {
    throw new Error(`같은 slug 의 글이 이미 있습니다: ${post.slug}`);
  }
  writeFileSync(path, `${JSON.stringify(post, null, 2)}\n`);
  return path;
}
