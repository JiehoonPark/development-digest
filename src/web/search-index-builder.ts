import type { ArchiveData } from "../data/digest-archiver.js";

interface SearchIndexItem {
  title: string;
  summary: string;
  keyPoints: string[];
  sourceName: string;
  category: string;
  date: string;
  url: string;
  detailUrl: string;
}

interface SearchIndex {
  items: SearchIndexItem[];
}

export type UrlStyle = "html" | "trailing-slash";

export interface BuildSearchIndexOptions {
  /**
   * 이메일 호환을 위해 `.html` 확장자 URL을 쓸지, Next.js trailing-slash 경로를 쓸지.
   * 기본값 `"html"` — 기존 이메일 composer 동작 유지.
   */
  urlStyle?: UrlStyle;
}

export function buildSearchIndex(
  archives: ArchiveData[],
  baseUrl: string,
  options: BuildSearchIndexOptions = {}
): SearchIndex {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const urlStyle = options.urlStyle ?? "html";
  const items: SearchIndexItem[] = [];

  for (const archive of archives) {
    const [year, month, day] = archive.date.split("-");

    for (const section of archive.sections) {
      for (const item of section.items) {
        const detailSuffix =
          urlStyle === "trailing-slash" ? `${item.slug}/` : `${item.slug}.html`;
        items.push({
          title: item.title,
          summary: item.summary,
          keyPoints: item.keyPoints ?? [],
          sourceName: item.sourceName,
          category: section.category,
          date: archive.date,
          url: item.url,
          detailUrl: `${base}${year}/${month}/${day}/${detailSuffix}`,
        });
      }
    }
  }

  return { items };
}
