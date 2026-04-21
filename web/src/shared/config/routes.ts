/**
 * 사이트 내부 경로. **basePath는 포함하지 않는다** — Next.js `<Link>` 와 `router.push` 가
 * basePath 를 자동으로 prepend 하므로 여기서 직접 붙이면 `/development-digest/development-digest/…`
 * 로 이중 prefix 돼 404 난다.
 */

export const ROUTES = {
  home: "/",
  archive: "/archive/",
  sources: "/sources/",
  settings: "/settings/",
  dailyDigest: (year: string, month: string, day: string) =>
    `/${year}/${month}/${day}/`,
  articleDetail: (year: string, month: string, day: string, slug: string) =>
    `/${year}/${month}/${day}/${slug}/`,
} as const;

export const EXTERNAL = {
  repo: "https://github.com/JiehoonPark/development-digest",
  feedbackRepo: "JiehoonPark/development-digest",
} as const;
