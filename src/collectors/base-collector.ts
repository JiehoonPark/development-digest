import type { Source } from "../../config/sources/types.js";
import type { CollectedItem, CollectorResult } from "./types.js";
import { withRetry } from "../utils/retry.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("collector");

export abstract class BaseCollector {
  constructor(protected readonly source: Source) {}

  async collect(): Promise<CollectorResult> {
    try {
      const items = await withRetry(
        () => this.fetchItems(),
        this.source.id,
        { maxRetries: 2 }
      );

      const filtered = items.filter((item) => this.isValid(item));

      log.info(
        { source: this.source.id, count: filtered.length },
        "수집 완료"
      );

      return { sourceId: this.source.id, items: filtered };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error({ source: this.source.id, error: message }, "수집 실패");
      return { sourceId: this.source.id, items: [], error: message };
    }
  }

  protected abstract fetchItems(): Promise<CollectedItem[]>;

  protected isValid(item: CollectedItem): boolean {
    return !!(item.url && item.title && item.publishedAt);
  }

  protected buildItem(
    partial: Partial<CollectedItem> & Pick<CollectedItem, "url" | "title">
  ): CollectedItem {
    return {
      sourceId: this.source.id,
      sourceName: this.source.name,
      category: this.source.category,
      language: this.source.language,
      publishedAt: new Date().toISOString(),
      contentType: "article",
      ...partial,
    };
  }
}
