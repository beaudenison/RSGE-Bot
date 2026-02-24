import {
  EnrichedItemResult,
  ItemDbSummaryItem,
} from "../types/runescape-item";
import { GeApiService } from "./ge-api";

const MAX_PREFIX_PAGES = 8;
const MAX_FALLBACK_PAGES = 12;

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function scoreItem(name: string, query: string): number {
  const normalizedName = normalize(name);

  if (normalizedName === query) {
    return 100;
  }
  if (normalizedName.startsWith(query)) {
    return 80;
  }
  if (normalizedName.includes(query)) {
    return 60;
  }

  return 0;
}

export class ItemSearchService {
  private readonly cache = new Map<string, ItemDbSummaryItem[]>();

  constructor(private readonly geApi: GeApiService) {}

  async search(query: string): Promise<EnrichedItemResult | null> {
    const cleaned = normalize(query);
    if (!cleaned) {
      return null;
    }

    const candidates = await this.findCandidates(cleaned);
    if (candidates.length === 0) {
      return null;
    }

    const ranked = candidates
      .map((item) => ({ item, score: scoreItem(item.name, cleaned) }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return left.item.name.length - right.item.name.length;
      });

    const best = ranked[0]?.item;
    if (!best) {
      return null;
    }

    const detailResponse = await this.geApi.getItemDetail(best.id);
    const realtimeResponse = await this.geApi.getRealtimePrice(best.id);

    return {
      item: detailResponse.item,
      realtime: realtimeResponse?.[String(best.id)],
      alternatives: ranked
        .map((entry) => entry.item)
        .filter((item) => item.id !== best.id)
        .slice(0, 5),
    };
  }

  private async findCandidates(query: string): Promise<ItemDbSummaryItem[]> {
    const directCandidates = await this.queryByPrefix(query, MAX_PREFIX_PAGES);

    const exactOrContains = directCandidates.filter((item) =>
      normalize(item.name).includes(query)
    );

    if (exactOrContains.length > 0) {
      return exactOrContains;
    }

    const firstLetter = query[0];
    if (!firstLetter) {
      return [];
    }

    const fallbackCandidates = await this.queryByPrefix(
      firstLetter,
      MAX_FALLBACK_PAGES
    );

    return fallbackCandidates.filter((item) =>
      normalize(item.name).includes(query)
    );
  }

  private async queryByPrefix(
    prefix: string,
    maxPages: number
  ): Promise<ItemDbSummaryItem[]> {
    const cacheKey = `${prefix}:${maxPages}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const items: ItemDbSummaryItem[] = [];
    const seen = new Set<number>();

    for (let page = 1; page <= maxPages; page += 1) {
      const response = await this.geApi.searchItemsByPrefix(prefix, page);
      const pageItems = response.items ?? [];

      if (pageItems.length === 0) {
        break;
      }

      for (const item of pageItems) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          items.push(item);
        }
      }

      if (pageItems.length < 12) {
        break;
      }
    }

    this.cache.set(cacheKey, items);
    return items;
  }
}
