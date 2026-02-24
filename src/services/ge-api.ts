import {
  ItemDbDetailResponse,
  ItemDbItemsResponse,
  RealtimeResponse,
} from "../types/runescape-item";

const ITEM_DB_BASE = "https://services.runescape.com/m=itemdb_rs/api/catalogue";
const REALTIME_BASE = "https://api.weirdgloop.org/exchange/history/rs";

export class GeApiService {
  constructor(private readonly userAgent: string) {}

  async searchItemsByPrefix(prefix: string, page = 1): Promise<ItemDbItemsResponse> {
    const params = new URLSearchParams({
      category: "0",
      alpha: prefix,
      page: String(page),
    });

    return this.fetchJson<ItemDbItemsResponse>(
      `${ITEM_DB_BASE}/items.json?${params.toString()}`,
      {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "application/json",
        },
      }
    );
  }

  async getItemDetail(itemId: number): Promise<ItemDbDetailResponse> {
    const params = new URLSearchParams({ item: String(itemId) });

    return this.fetchJson<ItemDbDetailResponse>(
      `${ITEM_DB_BASE}/detail.json?${params.toString()}`,
      {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "application/json",
        },
      }
    );
  }

  async getRealtimePrice(itemId: number): Promise<RealtimeResponse | null> {
    const params = new URLSearchParams({ id: String(itemId) });
    try {
      return await this.fetchJson<RealtimeResponse>(
        `${REALTIME_BASE}/latest?${params.toString()}`,
        {
          headers: {
            "User-Agent": this.userAgent,
            Accept: "application/json",
          },
        }
      );
    } catch {
      return null;
    }
  }

  private async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${url}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
