import * as cheerio from "cheerio";
import { BaseCollector } from "./base-collector.js";
import type { CollectedItem } from "./types.js";

export class GithubTrendingCollector extends BaseCollector {
  protected async fetchItems(): Promise<CollectedItem[]> {
    const res = await fetch("https://github.com/trending?since=daily", {
      headers: {
        "User-Agent": "DevDigest/1.0",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub Trending ${res.status}`);
    }

    const html = await res.text();
    return this.parseHtml(html);
  }

  private parseHtml(html: string): CollectedItem[] {
    const $ = cheerio.load(html);
    const items: CollectedItem[] = [];

    $("article.Box-row").each((_, el) => {
      if (items.length >= 15) return false;

      const titleEl = $(el).find("h2 a");
      const repoPath = titleEl.attr("href")?.trim();
      if (!repoPath) return;

      const repoName = repoPath.slice(1); // "/user/repo" → "user/repo"
      const description = $(el).find("p").text().trim();
      const starsText = $(el).find("[href$='/stargazers']").text().trim();
      const stars = parseInt(starsText.replace(/,/g, ""), 10) || 0;
      const language = $(el).find("[itemprop='programmingLanguage']").text().trim();

      items.push(
        this.buildItem({
          url: `https://github.com${repoPath}`,
          title: `${repoName}${language ? ` (${language})` : ""}`,
          summary: description.slice(0, 300),
          engagement: stars,
          contentType: "repo",
          tags: ["github", language].filter(Boolean),
        })
      );
    });

    return items;
  }
}
