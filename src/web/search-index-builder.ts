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

export function buildSearchIndex(archives: ArchiveData[], baseUrl: string): SearchIndex {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const items: SearchIndexItem[] = [];

  for (const archive of archives) {
    const [year, month, day] = archive.date.split("-");

    for (const section of archive.sections) {
      for (const item of section.items) {
        items.push({
          title: item.title,
          summary: item.summary,
          keyPoints: item.keyPoints ?? [],
          sourceName: item.sourceName,
          category: section.category,
          date: archive.date,
          url: item.url,
          detailUrl: `${base}${year}/${month}/${day}/${item.slug}.html`,
        });
      }
    }
  }

  return { items };
}
