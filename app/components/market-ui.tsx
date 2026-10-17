import type { MarketData } from '../../lib/market-types';

export const snapshotMode = process.env.NEXT_PUBLIC_MARKET_MODE === 'snapshot';
export const stamp = (value: string | null, full = true) => value ? new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  ...(full ? { year: 'numeric' as const } : {}),
}).format(new Date(value)) : '尚未更新';
export const money = (value: number | null) => value === null ? '—' : value >= 1e8 ? `${(value / 1e8).toFixed(2)} 亿` : `${(value / 1e4).toFixed(0)} 万`;
export const change = (value: number | null) => value === null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
export const feedIsOld = (at: string | null, mode: string) => !at || Date.now() - Date.parse(at) > (mode === 'snapshot' ? 40 : 5) * 60_000;

export function emptyPool(previous: MarketData['limitUp']): MarketData['limitUp'] {
  return { ...previous, status: 'unavailable', tradeDate: null, fetchedAt: null, stocks: [], summary: null, sectors: [], ladder: [], message: '涨停数据暂时未能更新，可前往来源查看。' };
}
export function FeedState({ status, at, mode, loading }: { status?: string; at?: string | null; mode?: string; loading: boolean }) {
  const healthy = status === 'ok' && !feedIsOld(at || null, mode || 'live');
  const text = loading ? at ? '检查更新中' : '正在连接' : healthy ? mode === 'snapshot' ? '定时更新' : '自动更新中' : status === 'empty' ? '暂无数据' : at ? '历史快照' : '连接暂不可用';
  return <span className={`lj-feed-state${healthy ? ' is-active' : ''}`} role="status"><i />{text}</span>;
}
export function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="lj-text-link">{children} <span aria-hidden="true">↗</span></a>;
}
export function LoadingRows({ label }: { label: string }) {
  return <div className="lj-loading-rows" role="status"><span className="sr-only">{label}</span>{[0, 1, 2].map(item => <div aria-hidden="true" key={item}><i /><span /><span /></div>)}</div>;
}
