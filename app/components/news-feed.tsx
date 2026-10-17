'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { MarketData, NewsItem } from '../../lib/market-types';
import { SectionTitle } from './site-chrome';
import { FeedState, LoadingRows, SourceLink, feedIsOld, snapshotMode, stamp } from './market-ui';

const EMPTY: NewsItem[] = [];
const FILTERS: Record<string, RegExp | null> = {
  '全部快讯': null,
  '宏观政策': /央行|政策|财政|国务院|经济|利率|监管|关税/,
  'A股动态': /A股|涨停|沪指|深成|创业板|股市|上市|公告|业绩|回购|证券/,
  '产业科技': /科技|AI|人工智能|算力|芯片|半导体|机器人|新能源|医药|产业/,
  '环球市场': /美股|美联储|美元|欧洲|黄金|原油|港股|恒生|日经|全球/,
};

export function NewsSection({ data, loading, error, refresh }: { data: MarketData | null; loading: boolean; error: boolean; refresh: () => void }) {
  const [category, setCategory] = useState('全部快讯');
  const [query, setQuery] = useState('');
  const [important, setImportant] = useState(false);
  const [visible, setVisible] = useState(7);
  const incoming = data?.news.items || EMPTY;
  const [buffer, setBuffer] = useState({ source: incoming, shown: incoming });
  // Keep the reading position when polling inserts new headlines. Only the
  // initial load is automatic; readers choose when to reveal later arrivals.
  if (incoming !== buffer.source) {
    const additions = incoming.filter(item => !buffer.shown.some(old => old.id === item.id));
    setBuffer({ source: incoming, shown: !buffer.shown.length || !additions.length ? incoming : buffer.shown });
  }
  const newCount = incoming.filter(item => !buffer.shown.some(old => old.id === item.id)).length;
  const filter = FILTERS[category];
  const filtered = buffer.shown.filter(item => (!filter || filter.test(item.title + item.summary)) && (!important || item.important) && `${item.title} ${item.summary}`.toLowerCase().includes(query.trim().toLowerCase()));
  const hasFilters = category !== '全部快讯' || !!query || important;
  const reset = () => { setCategory('全部快讯'); setQuery(''); setImportant(false); setVisible(7); };
  const stale = buffer.shown.length > 0 && (error || data?.news.status === 'stale' || (data?.news.fetchedAt && feedIsOld(data.news.fetchedAt, data.mode)));

  return <section className="lj-news lj-wrap" id="news" aria-labelledby="news-title">
    <SectionTitle index="01" english="MARKET INTELLIGENCE" title="热点新闻" id="news-title">
      <div className="lj-live-controls"><FeedState status={data?.news.status} at={data?.news.fetchedAt} mode={data?.mode} loading={loading} /><button className="lj-refresh" onClick={refresh} disabled={loading} aria-label="刷新市场数据"><span aria-hidden="true">↻</span> 刷新</button></div>
    </SectionTitle>
    <div className="lj-news-layout"><div className="lj-news-main">
      <div className="lj-news-search-row"><label className="lj-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="搜索新闻" value={query} onChange={event => { setQuery(event.target.value); setVisible(7); }} placeholder="搜索公司、产业或关键词" />{query && <button className="lj-clear-input" onClick={() => setQuery('')} aria-label="清空新闻搜索">×</button>}</label><label className="lj-important-switch"><input type="checkbox" checked={important} onChange={event => { setImportant(event.target.checked); setVisible(7); }} />只看要闻</label></div>
      <div className="lj-tabs" aria-label="新闻分类">{Object.keys(FILTERS).map(item => <button key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setVisible(7); }}>{item}</button>)}</div>
      <div className="lj-feed-meta"><span>北京时间 · {data?.news.fetchedAt ? `更新于 ${stamp(data.news.fetchedAt, false)}` : '等待更新'}</span><span role="status">{buffer.shown.length ? `${filtered.length} 条${hasFilters ? '匹配快讯' : '快讯'}` : '7×24 财经快讯'}</span></div>
      {newCount > 0 && <div className="lj-news-arrivals" role="status"><button onClick={() => { setBuffer({ source: incoming, shown: incoming }); setVisible(7); }}>{newCount} 条新快讯 · 点击载入 <span aria-hidden="true">↑</span></button></div>}
      {stale && <p className="lj-data-notice">当前为上次获取的快讯。请核对发布时间，也可点击原文确认。</p>}
      {filtered.length > 0 ? <ol className="lj-news-list">{filtered.slice(0, visible).map(item => <NewsRow key={item.id} item={item} />)}</ol> : loading && !buffer.shown.length ? <LoadingRows label="正在获取财经快讯" /> : <div className="lj-news-empty">
        <span className="lj-empty-icon" aria-hidden="true">{buffer.shown.length ? '⌕' : '≋'}</span><h3>{buffer.shown.length ? '没有匹配的快讯' : '快讯暂时未能更新'}</h3>
        <p>{buffer.shown.length ? '试试更短的关键词，或清除分类和要闻条件。' : '连接暂时中断，请稍后重试。'}</p>
        {buffer.shown.length ? <button className="lj-button lj-button-outline" onClick={reset}>清除新闻筛选</button> : <div className="lj-empty-actions"><button className="lj-button lj-button-outline" onClick={refresh} disabled={loading}>重新连接 ↻</button><Link className="lj-text-link" href="/research/">先读研究档案 →</Link></div>}
      </div>}
      {filtered.length > visible && <button className="lj-more" onClick={() => setVisible(value => value + 10)}>继续阅读 · 还有 {filtered.length - visible} 条 <span aria-hidden="true">↓</span></button>}
      <p className="lj-source-note">分类按关键词筛选。{snapshotMode ? '定时同步，可能延迟。' : '每60秒检查，新快讯由你选择载入。'}</p>
    </div><aside className="lj-observer"><span className="lj-kicker">THE RESEARCH LENS</span><h3>消息之外，<br />多问一步。</h3><p>真正值得关注的，<br />是新闻如何改变企业的生意。</p><ol><li><span>01</span><div><strong>发生了什么？</strong><small>回到公告和原始信息，确认事实。</small></div></li><li><span>02</span><div><strong>影响哪一环？</strong><small>沿着产业链，寻找需求与成本的变化。</small></div></li><li><span>03</span><div><strong>怎样被验证？</strong><small>让订单、利润和现金流回答问题。</small></div></li></ol><Link href="/research/" className="lj-observer-link">阅读研究档案 <span aria-hidden="true">↗</span></Link></aside></div>
  </section>;
}

function NewsRow({ item }: { item: NewsItem }) {
  const date = new Date(item.publishedAt);
  return <li className={item.important ? 'lj-news-item is-important' : 'lj-news-item'}>
    <div className="lj-news-time"><time dateTime={item.publishedAt}>{new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)}</time><small>{new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit' }).format(date)}</small></div>
    <div><a href={item.url} target="_blank" rel="noopener noreferrer"><h3>{item.important && <span className="lj-important">要闻</span>}{item.title}<span className="lj-news-arrow" aria-hidden="true">↗</span></h3></a>{item.summary && item.summary !== item.title && <details className="lj-news-detail"><summary>展开摘要</summary><p>{item.summary}</p><SourceLink href={item.url}>阅读全文</SourceLink></details>}</div>
  </li>;
}
