/**
 * 사이트 전역 경로. 하드코딩된 URL 사용을 차단하고 `basePath` 조합을 한 곳에서 관리.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const ROUTES = {
  home: `${basePath}/`,
  archive: `${basePath}/archive/`,
  sources: `${basePath}/sources/`,
  settings: `${basePath}/settings/`,
  dailyDigest: (year: string, month: string, day: string) =>
    `${basePath}/${year}/${month}/${day}/`,
  articleDetail: (year: string, month: string, day: string, slug: string) =>
    `${basePath}/${year}/${month}/${day}/${slug}/`,
} as const;

export const EXTERNAL = {
  repo: "https://github.com/JiehoonPark/development-digest",
  feedbackRepo: "JiehoonPark/development-digest",
} as const;
