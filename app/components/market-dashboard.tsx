'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MarketData } from '../../lib/market-types';
import { NewsSection } from './news-feed';
import { LimitSection } from './limit-review';
import { emptyPool, snapshotMode } from './market-ui';

const basePath = process.env.NEXT_PUBLIC_PAGES_BASE_PATH || '';
const snapshotURL = process.env.NEXT_PUBLIC_MARKET_SNAPSHOT_URL || 'https://raw.githubusercontent.com/MISSyouy7/whitebeard-research/market-data/market.json';
function validData(value: unknown): value is MarketData {
  const data = value as MarketData | undefined;
  return data?.version === 1 && Array.isArray(data.news?.items) && Array.isArray(data.limitUp?.stocks) && Array.isArray(data.limitUp.sectors) && Array.isArray(data.limitUp.ladder);
}

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
      const timeout = setTimeout(() => current?.abort(), 22000);
      setLoading(true);
      setToday(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
      try {
        const endpoint = snapshotMode ? snapshotURL : `${basePath}/api/market${requestedDate ? `?date=${requestedDate}` : ''}`;
        let response: Response;
        try { response = await fetch(endpoint, { signal: current.signal, cache: 'no-store' }); }
        catch (error) {
          if (!snapshotMode || current.signal.aborted) throw error;
          response = await fetch(`${basePath}/data/market.json`, { signal: current.signal, cache: 'no-store' });
        }
        // A published static site still opens before its first scheduled feed run.
        if (!response.ok && snapshotMode) response = await fetch(`${basePath}/data/market.json`, { signal: current.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('unavailable');
        const result = await response.json();
        if (!validData(result)) throw new Error('invalid feed');
        const previous = lastGood.current;
        // A worker restart can lose server-side cache. Preserve useful browser
        // data too, without relabeling its timestamp or requested trading date.
        if (result.news.status === 'unavailable' && previous?.news.items.length) {
          result.news = { ...previous.news, status: 'stale' };
        }
        if (result.limitUp.status === 'unavailable' && previous?.limitUp.stocks.length && (!requestedDate || previous.limitUp.tradeDate === requestedDate)) {
          result.limitUp = { ...previous.limitUp, status: 'stale' };
        }
        if (!disposed) { lastGood.current = result; setData(result); setError(false); }
      } catch {
        if (!disposed) {
          const previous = lastGood.current;
          setData(previous ? { ...previous, news: { ...previous.news, status: 'stale' }, limitUp: !requestedDate || previous.limitUp.tradeDate === requestedDate ? { ...previous.limitUp, status: 'stale' } : emptyPool(previous.limitUp) } : null);
          setError(true);
        }
      } finally { clearTimeout(timeout); busy = false; if (!disposed) setLoading(false); }
    };
    void refresh();
    const interval = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 60_000);
    const visibility = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { disposed = true; current?.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', visibility); };
  }, [requestedDate, attempt]);
  const refresh = useCallback(() => setAttempt(value => value + 1), []);
  return <>
    <NewsSection data={data} loading={loading} error={error} refresh={refresh} />
    <LimitSection data={data} loading={loading} refresh={refresh} requestedDate={requestedDate} setRequestedDate={date => { setData(previous => previous ? { ...previous, limitUp: emptyPool(previous.limitUp) } : null); setRequestedDate(date); }} today={today} />
  </>;
}
