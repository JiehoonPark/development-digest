import type { Source } from "./types.js";

export const frameworkBlogs: Source[] = [
  {
    id: "react-blog",
    name: "React Blog",
    type: "rss",
    category: "framework-blog",
    url: "https://react.dev/rss.xml",
    weight: 10,
    language: "en",
  },
  {
    id: "nextjs-blog",
    name: "Next.js Blog",
    type: "rss",
    category: "framework-blog",
    url: "https://nextjs.org/feed.xml",
    weight: 10,
    language: "en",
  },
  // vercel-blog 제거 — Atom 피드 날짜 파싱 오류 (rss-parser 내부 RangeError: Invalid time value)
  {
    id: "typescript-blog",
    name: "TypeScript Blog",
    type: "rss",
    category: "framework-blog",
    url: "https://devblogs.microsoft.com/typescript/feed/",
    weight: 9,
    language: "en",
  },
  {
    id: "nodejs-blog",
    name: "Node.js Blog",
    type: "rss",
    category: "framework-blog",
    url: "https://nodejs.org/en/feed/blog.xml",
    weight: 7,
    language: "en",
  },
  {
    id: "tailwind-blog",
    name: "Tailwind CSS Blog",
    type: "rss",
    category: "framework-blog",
    url: "https://tailwindcss.com/feeds/feed.xml",
    weight: 8,
    language: "en",
  },
  {
    id: "web-dev",
    name: "web.dev",
    type: "rss",
    category: "framework-blog",
    url: "https://web.dev/feed.xml",
    weight: 8,
    language: "en",
  },
];
