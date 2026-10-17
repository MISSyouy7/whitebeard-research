'use client';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';

const EVENT = 'lujian:research-filters';
const KEY = 'lujian:research-return';
const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  window.addEventListener(EVENT, callback);
  return () => { window.removeEventListener('popstate', callback); window.removeEventListener(EVENT, callback); };
};
export function rememberResearch(search: string) {
  try { sessionStorage.setItem(KEY, '/research/' + search); } catch { /* Reading still works when storage is unavailable. */ }
}
export function useResearchFilters() {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => '');
  const params = new URLSearchParams(search);
  const category = params.get('category') || '全部';
  const query = params.get('q') || '';
  const update = (next: { category: string; query: string }) => {
    const value = new URLSearchParams();
    if (next.category !== '全部') value.set('category', next.category);
    if (next.query) value.set('q', next.query);
    const suffix = value.size ? `?${value}` : '';
    window.history.replaceState(window.history.state, '', window.location.pathname + suffix);
    rememberResearch(suffix);
    window.dispatchEvent(new Event(EVENT));
  };
  return { category, query, search, update };
}
export function ResearchBackLink() {
  const href = useSyncExternalStore(subscribe, () => {
    try { const value = sessionStorage.getItem(KEY); return value && /^\/research\/(\?|$)/.test(value) ? value : '/research/'; }
    catch { return '/research/'; }
  }, () => '/research/');
  return <Link className="lj-text-link" href={href}>← 返回研究列表</Link>;
}
