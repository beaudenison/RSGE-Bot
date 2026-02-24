export type ItemDbTrend = "negative" | "neutral" | "positive";

export interface ItemDbPrice {
  trend: ItemDbTrend;
  price: string | number;
}

export interface ItemDbTimespan {
  trend: ItemDbTrend;
  change: string;
}

export interface ItemDbSummaryItem {
  icon: string;
  icon_large: string;
  id: number;
  type: string;
  typeIcon: string;
  name: string;
  description: string;
  current: ItemDbPrice;
  today: ItemDbPrice;
  members: string;
}

export interface ItemDbDetailItem extends ItemDbSummaryItem {
  day30: ItemDbTimespan;
  day90: ItemDbTimespan;
  day180: ItemDbTimespan;
}

export interface ItemDbItemsResponse {
  total: number;
  items?: ItemDbSummaryItem[];
}

export interface ItemDbDetailResponse {
  item: ItemDbDetailItem;
}

export interface RealtimePrice {
  id: string;
  timestamp: string;
  price: number;
  volume: number;
}

export interface RealtimeResponse {
  [itemId: string]: RealtimePrice;
}

export interface EnrichedItemResult {
  item: ItemDbDetailItem;
  realtime?: RealtimePrice;
  alternatives: ItemDbSummaryItem[];
}
