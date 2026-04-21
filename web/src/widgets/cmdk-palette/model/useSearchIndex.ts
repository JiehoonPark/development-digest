"use client";

import { useEffect, useRef, useState } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";

export interface SearchItem {
  title: string;
  summary: string;
  keyPoints: string[];
  sourceName: string;
  category: string;
  date: string;
  url: string;
  detailUrl: string;
}

const FUSE_OPTIONS: IFuseOptions<SearchItem> = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "summary", weight: 0.25 },
    { name: "keyPoints", weight: 0.15 },
    { name: "sourceName", weight: 0.05 },
    { name: "date", weight: 0.05 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Cmd+K가 처음 열릴 때 `/search-index.json` 을 한 번만 fetch, Fuse 인덱스 캐시.
 */
export function useSearchIndex(active: boolean) {
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const fuseRef = useRef<Fuse<SearchItem> | null>(null);

  useEffect(() => {
    if (!active || items !== null) return;
    const controller = new AbortController();
    fetch(`${BASE_PATH}/search-index.json`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { items: SearchItem[] }) => {
        setItems(data.items);
        fuseRef.current = new Fuse(data.items, FUSE_OPTIONS);
      })
      .catch(() => {
        setItems([]);
      });
    return () => controller.abort();
  }, [active, items]);

  const search = (query: string, limit = 12): SearchItem[] => {
    if (!fuseRef.current) return [];
    if (!query.trim()) return (items ?? []).slice(0, limit);
    return fuseRef.current
      .search(query, { limit })
      .map((r) => r.item);
  };

  return { items, search };
}
