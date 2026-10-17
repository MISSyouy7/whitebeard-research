export type FeedStatus = 'ok' | 'stale' | 'unavailable' | 'empty';
type Source = { name: string; url: string };
export type NewsItem = { id: string; title: string; summary: string; publishedAt: string; url: string; important: boolean; source: string };
export type LimitStock = { code: string; name: string; industry: string; boards: number; price: number | null; change: number | null; turnover: number | null; sealAmount: number | null; firstSeal: string | null; lastSeal: string | null; breaks: number | null; url: string };
export type MarketData = {
  version: 1; mode: 'live' | 'snapshot'; checkedAt: string | null; refreshSeconds: number;
  news: { status: FeedStatus; source: Source; fetchedAt: string | null; latestAt: string | null; items: NewsItem[]; message?: string };
  limitUp: { status: FeedStatus; source: Source; scope: string; fetchedAt: string | null; tradeDate: string | null; stocks: LimitStock[]; message?: string;
    summary: { total: number; firstBoard: number; consecutive: number; highest: number } | null;
    sectors: { name: string; count: number }[]; ladder: { boards: number; count: number }[] };
};
