'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MarketData } from '../../lib/market-types';
import { loadClientMarket, readMarketCache, writeMarketCache } from '../../lib/market-client.mjs';
import { NewsSection } from './news-feed';
import { LimitSection } from './limit-review';
import { emptyPool, snapshotMode } from './market-ui';
import { MarketOverview } from './market-overview';
import { GlassHero } from './glass-hero';
import Link from 'next/link';

const basePath = process.env.NEXT_PUBLIC_PAGES_BASE_PATH || '';
const snapshotURL = process.env.NEXT_PUBLIC_MARKET_SNAPSHOT_URL || 'https://raw.githubusercontent.com/MISSyouy7/whitebeard-research/market-data/market.json';
export function MarketDashboard() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestedDate, setRequestedDate] = useState('');
  const [today, setToday] = useState('');
  const [attempt, setAttempt] = useState(0);
  const lastGood = useRef<MarketData | null>(null);
  useEffect(() => {
    let current: AbortController | null = null;
    let disposed = false;
    let busy = false;
    const refresh = async () => {
      if (busy || disposed) return;
      busy = true; current = new AbortController();
      setLoading(true);
      setToday(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
      try {
        if (snapshotMode && !requestedDate && !lastGood.current) {
          const cached = readMarketCache();
          if (cached) { lastGood.current = cached; setData(cached); }
        }
        const result = await loadClientMarket({
          snapshotMode, snapshotURL, bundledURL: `${basePath}/data/market.json`,
          apiURL: `${basePath}/api/market${requestedDate ? `?date=${requestedDate}` : ''}`,
          requestedDate, previous: lastGood.current, signal: current.signal,
          onSnapshot: cached => {
            if (!disposed) { lastGood.current = cached; setData(cached); }
          },
        });
        if (!disposed) {
          lastGood.current = result; setData(result); setError(false);
          if (snapshotMode && !requestedDate) writeMarketCache(result);
        }
      } catch {
        if (!disposed) {
          const previous = lastGood.current;
          setData(previous ? { ...previous, news: { ...previous.news, status: 'stale' }, limitUp: !requestedDate || previous.limitUp.tradeDate === requestedDate ? { ...previous.limitUp, status: 'stale' } : emptyPool(previous.limitUp) } : null);
          setError(true);
        }
      } finally { busy = false; if (!disposed) setLoading(false); }
    };
    void refresh();
    const interval = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 60_000);
    const visibility = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { disposed = true; current?.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', visibility); };
  }, [requestedDate, attempt]);
  const refresh = useCallback(() => setAttempt(value => value + 1), []);
  return <>
    <GlassHero data={data} loading={loading} />
    <nav className="lj-workspace-tabs lj-wrap" aria-label="工作台快捷入口"><a href="#overview" className="is-current">市场总览</a><a href="#news">7×24 快讯</a><a href="#limit-up">涨停复盘</a><Link href="/research/">研究洞察</Link><span>A股 · 北京时间</span></nav>
    <MarketOverview data={data} loading={loading} refresh={refresh} />
    <NewsSection data={data} loading={loading} error={error} refresh={refresh} />
    <LimitSection data={data} loading={loading} refresh={refresh} requestedDate={requestedDate} setRequestedDate={date => { setData(previous => previous ? { ...previous, limitUp: emptyPool(previous.limitUp) } : null); setRequestedDate(date); }} today={today} />
  </>;
}
