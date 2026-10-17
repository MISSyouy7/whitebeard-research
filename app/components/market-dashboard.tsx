'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MarketData, LimitStock, NewsItem } from '../../lib/market-types';
import { SectionTitle } from './site-chrome';

const basePath = process.env.NEXT_PUBLIC_PAGES_BASE_PATH || '';
const snapshotMode = process.env.NEXT_PUBLIC_MARKET_MODE === 'snapshot';
const snapshotURL = process.env.NEXT_PUBLIC_MARKET_SNAPSHOT_URL || 'https://raw.githubusercontent.com/MISSyouy7/whitebeard-research/market-data/market.json';
const NEWS_FILTERS: Record<string, RegExp | null> = { '全部快讯': null, '宏观政策': /央行|政策|财政|国务院|经济|利率|监管|关税/, 'A股动态': /A股|涨停|沪指|深成|创业板|股市|上市|公告|业绩|回购|证券/, '产业科技': /科技|AI|人工智能|算力|芯片|半导体|机器人|新能源|医药|产业/, '环球市场': /美股|美联储|美元|欧洲|黄金|原油|港股|恒生|日经|全球/ };
const stamp = (value: string | null, full = true) => value ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', ...(full ? { year: 'numeric' as const } : {}) }).format(new Date(value)) : '尚未更新';
const money = (value: number | null) => value === null ? '—' : value >= 1e8 ? `${(value / 1e8).toFixed(2)} 亿` : `${(value / 1e4).toFixed(0)} 万`;
function validData(value: unknown): value is MarketData {
  const data = value as MarketData | undefined;
  return data?.version === 1 && Array.isArray(data.news?.items) && Array.isArray(data.limitUp?.stocks) && Array.isArray(data.limitUp.sectors) && Array.isArray(data.limitUp.ladder);
}
function feedIsOld(at: string | null, mode: string) { return !at || Date.now() - Date.parse(at) > (mode === 'snapshot' ? 40 : 5) * 60_000; }

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
        if (!disposed) { lastGood.current = result; setData(result); setError(false); }
      } catch {
        if (!disposed) {
          const previous = lastGood.current;
          setData(previous && (!requestedDate || previous.limitUp.tradeDate === requestedDate) ? { ...previous, news: { ...previous.news, status: 'stale' }, limitUp: { ...previous.limitUp, status: 'stale' } } : null);
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
    <LimitSection data={data} loading={loading} refresh={refresh} requestedDate={requestedDate} setRequestedDate={date => { setData(null); setRequestedDate(date); }} today={today} />
  </>;
}

function FeedState({ status, at, mode, loading }: { status?: string; at?: string | null; mode?: string; loading: boolean }) {
  const healthy = status === 'ok' && !feedIsOld(at || null, mode || 'live');
  const text = loading ? '正在更新' : healthy ? mode === 'snapshot' ? '定时更新' : '自动更新中' : status === 'empty' ? '等待数据' : at ? '历史快照' : '数据暂不可用';
  return <span className={`lj-feed-state${healthy ? ' is-active' : ''}`} role="status"><i />{text}</span>;
}
function SourceLink({ href, children }: { href: string; children: React.ReactNode }) { return <a href={href} target="_blank" rel="noopener noreferrer" className="lj-text-link">{children} <span aria-hidden="true">↗</span></a>; }

function NewsSection({ data, loading, error, refresh }: { data: MarketData | null; loading: boolean; error: boolean; refresh: () => void }) {
  const [category, setCategory] = useState('全部快讯');
  const [visible, setVisible] = useState(7);
  const filter = NEWS_FILTERS[category];
  const news = (data?.news.items || []).filter(item => !filter || filter.test(item.title + item.summary));
  return <section className="lj-news lj-wrap" id="news"><SectionTitle index="01" english="MARKET INTELLIGENCE" title="热点新闻"><div className="lj-live-controls"><FeedState status={data?.news.status} at={data?.news.fetchedAt} mode={data?.mode} loading={loading} /><button className="lj-refresh" onClick={refresh} disabled={loading} aria-label="刷新市场数据"><span aria-hidden="true">↻</span> 刷新</button></div></SectionTitle>
    <div className="lj-news-layout"><div className="lj-news-main"><div className="lj-tabs" aria-label="新闻分类">{Object.keys(NEWS_FILTERS).map(item => <button key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setVisible(7); }}>{item}</button>)}</div>
      <div className="lj-feed-meta"><span>7×24 财经快讯 · 北京时间</span><span>{data?.news.fetchedAt ? `获取于 ${stamp(data.news.fetchedAt, false)}` : '来源：东方财富'}</span></div>
      {(data?.news.status === 'stale' || error || (data?.news.fetchedAt && feedIsOld(data.news.fetchedAt, data.mode))) && <p className="lj-data-notice">更新暂不可用，已保留上次数据。请以新闻发布时间为准。</p>}
      {news.length ? <ol className="lj-news-list">{news.slice(0, visible).map(item => <NewsRow key={item.id} item={item} />)}</ol> : <div className="lj-news-empty"><span className="lj-empty-icon" aria-hidden="true">≋</span><h3>{loading ? '正在连接市场脉搏' : data?.news.items.length ? '这个分类暂无快讯' : '新闻更新，稍候抵达。'}</h3><p>{loading ? '正在获取最新公开快讯。' : data?.news.items.length ? '分类按标题关键词筛选，可切换到全部快讯。' : '当前未获取到最新快讯，你也可以直接查看来源。'}</p><SourceLink href="https://kuaixun.eastmoney.com/">查看财经快讯</SourceLink></div>}
      {news.length > visible && <button className="lj-more" onClick={() => setVisible(value => value + 10)}>展开更多快讯 <span>↓</span></button>}
      <p className="lj-source-note">来源：东方财富 · 标题及摘要仅作信息索引，点击查看原文。{snapshotMode ? '定时同步，可能延迟。' : '每60秒检查更新，来源可能延迟。'}</p>
    </div><aside className="lj-observer"><span className="lj-kicker">THE RESEARCH LENS</span><h3>消息之外，<br />多问一步。</h3><p>真正值得关注的，<br />是新闻如何改变企业的生意。</p><ol><li><span>01</span><div><strong>发生了什么？</strong><small>回到公告和原始信息，确认事实。</small></div></li><li><span>02</span><div><strong>影响哪一环？</strong><small>沿着产业链，寻找需求与成本的变化。</small></div></li><li><span>03</span><div><strong>怎样被验证？</strong><small>让订单、利润和现金流回答问题。</small></div></li></ol><a href="#research" className="lj-observer-link">沿着证据，继续研究 <span>↗</span></a></aside></div>
  </section>;
}
function NewsRow({ item }: { item: NewsItem }) {
  const date = new Date(item.publishedAt);
  return <li className={item.important ? 'lj-news-item is-important' : 'lj-news-item'}><div className="lj-news-time"><time dateTime={item.publishedAt}>{new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)}</time><small>{new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit' }).format(date)}</small></div><div><a href={item.url} target="_blank" rel="noopener noreferrer"><h3>{item.important && <span className="lj-important">要闻</span>}{item.title}<span className="lj-news-arrow" aria-hidden="true">↗</span></h3></a>{item.summary && item.summary !== item.title && <details className="lj-news-detail"><summary>查看摘要</summary><p>{item.summary}</p></details>}</div></li>;
}

function exportCSV(stocks: LimitStock[], date: string) {
  const cell = (value: string | number | null) => '"' + String(value ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""') + '"';
  const rows = [['交易日期', '代码', '名称', '行业', '连板数', '涨幅(%)', '首次封板', '封单金额(元)', '炸板次数'], ...stocks.map(stock => [date, stock.code, stock.name, stock.industry, stock.boards, stock.change, stock.firstSeal, stock.sealAmount, stock.breaks])];
  const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `路见资本-涨停股池-${date}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function LimitSection({ data, loading, refresh, requestedDate, setRequestedDate, today }: { data: MarketData | null; loading: boolean; refresh: () => void; requestedDate: string; setRequestedDate: (date: string) => void; today: string }) {
  const [tab, setTab] = useState('全部');
  const [boardLevel, setBoardLevel] = useState<number | null>(null);
  const [industry, setIndustry] = useState('全部行业');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('boards');
  const [visible, setVisible] = useState(8);
  const pool = data?.limitUp;
  const stocks = (pool?.stocks || []).filter(stock => (boardLevel === null || stock.boards === boardLevel) && (tab === '全部' || (tab === '首板' ? stock.boards === 1 : stock.boards > 1)) && (industry === '全部行业' || stock.industry === industry) && `${stock.name} ${stock.code}`.includes(query.trim())).sort((a, b) => sort === 'time' ? (a.firstSeal || '99').localeCompare(b.firstSeal || '99') : b.boards - a.boards || (b.sealAmount || 0) - (a.sealAmount || 0));
  const stats = [['涨停家数', pool?.summary?.total, '只'], ['首板', pool?.summary?.firstBoard, '只'], ['连板', pool?.summary?.consecutive, '只'], ['最高连板', pool?.summary?.highest, '板']] as const;
  const reset = () => { setTab('全部'); setBoardLevel(null); setIndustry('全部行业'); setQuery(''); setVisible(8); };
  const minDate = today ? new Date(Date.parse(today + 'T00:00:00Z') - 30 * 86400000).toISOString().slice(0, 10) : '';
  return <section className="lj-limit-section" id="limit-up"><div className="lj-wrap"><SectionTitle index="02" english="A-SHARE / DAILY REVIEW" title="涨停复盘"><div className="lj-limit-controls"><FeedState status={pool?.status} at={pool?.fetchedAt} mode={data?.mode} loading={loading} />{!snapshotMode && <label className="lj-date-picker"><span>选择日期</span><input aria-label="涨停复盘日期" type="date" min={minDate} max={today} value={requestedDate} onChange={event => { reset(); setRequestedDate(event.target.value); }} /></label>}</div></SectionTitle>
    <div className="lj-limit-caption"><p>从连板梯队到行业分布，看清盘面的结构。</p><div>{pool?.tradeDate ? <>数据日期 <strong>{pool.tradeDate}</strong></> : '数据日期待确认'}{requestedDate && <button className="lj-inline-button" onClick={() => { reset(); setRequestedDate(''); }}>返回最近可用日</button>}</div></div>
    {(pool?.status === 'stale' || (pool?.fetchedAt && feedIsOld(pool.fetchedAt, data?.mode || 'live'))) && <p className="lj-data-notice">当前为历史快照，数据未更新；统计仅对应所示日期和获取时间。</p>}
    <div className="lj-stat-grid">{stats.map(([label, value, unit]) => <div key={label}><span>{label}</span><strong>{value ?? '—'}<small>{value !== undefined && unit}</small></strong></div>)}</div>
    {pool?.summary && <div className="lj-market-structure"><div><h3>连板梯队 <small>按连续涨停天数</small></h3><div className="lj-ladder">{pool.ladder.map(level => <button key={level.boards} aria-pressed={boardLevel === level.boards} onClick={() => { setBoardLevel(boardLevel === level.boards ? null : level.boards); setTab('全部'); setVisible(8); }}><b>{level.boards === 1 ? '首板' : `${level.boards}板`}</b><span style={{ width: `${Math.max(8, level.count / pool.summary!.total * 100)}%` }} /><strong>{level.count}<small>只</small></strong></button>)}</div></div><div><h3>行业分布 <small>股池内涨停数量</small></h3><div className="lj-sectors">{pool.sectors.slice(0, 6).map(sector => <button key={sector.name} aria-pressed={industry === sector.name} onClick={() => { setIndustry(industry === sector.name ? '全部行业' : sector.name); setVisible(8); }}><span>{sector.name}</span><b>{sector.count}<small>只</small></b></button>)}</div></div></div>}
    <div className="lj-pool-tools"><div className="lj-tabs" aria-label="涨停类型">{['全部', '首板', '连板'].map(item => <button key={item} aria-pressed={tab === item} onClick={() => { setTab(item); setBoardLevel(null); setVisible(8); }}>{item}</button>)}</div><div className="lj-pool-filters"><select aria-label="筛选行业" value={industry} onChange={event => { setIndustry(event.target.value); setVisible(8); }}><option>全部行业</option>{pool?.sectors.map(sector => <option key={sector.name}>{sector.name}</option>)}</select><select aria-label="排序方式" value={sort} onChange={event => setSort(event.target.value)}><option value="boards">连板高度优先</option><option value="time">首次封板时间</option></select><label className="lj-search"><span aria-hidden="true">⌕</span><input aria-label="搜索涨停股票" value={query} onChange={event => { setQuery(event.target.value); setVisible(8); }} placeholder="名称 / 代码" /></label></div></div>
    <div className="lj-table-scroll" role="region" aria-label="涨停股池明细，可横向滚动" tabIndex={0}><table className="lj-pool-table"><thead><tr><th scope="col">股票 / 代码</th><th scope="col">行业</th><th scope="col">连板</th><th scope="col">涨幅</th><th scope="col">首次封板</th><th scope="col">封单金额</th><th scope="col">炸板次数</th></tr></thead><tbody>{stocks.slice(0, visible).map(stock => <tr key={stock.code}><td><a href={stock.url} target="_blank" rel="noopener noreferrer"><strong>{stock.name} <span aria-hidden="true">↗</span></strong><small>{stock.code}</small></a></td><td>{stock.industry}</td><td><span className={`lj-board-badge${stock.boards > 1 ? ' is-high' : ''}`}>{stock.boards === 1 ? '首板' : `${stock.boards}连板`}</span></td><td className="lj-rise">{stock.change === null ? '—' : `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%`}</td><td className="lj-mono">{stock.firstSeal || '—'}</td><td className="lj-mono">{money(stock.sealAmount)}</td><td className="lj-mono">{stock.breaks ?? '—'}</td></tr>)}</tbody></table></div>
    {!stocks.length && <div className="lj-pool-empty"><h3>{loading ? '正在获取涨停股池…' : pool?.stocks.length ? '没有匹配的股票' : pool?.status === 'empty' ? '该日暂无可用股池' : '等待一份可核验的盘面。'}</h3><p>{pool?.stocks.length ? '调整行业、连板或搜索条件，查看其他股票。' : pool?.message || '数据连接暂不可用，当前不展示未经核验的行情。'}</p>{pool?.stocks.length ? <button className="lj-inline-button" onClick={reset}>清除筛选</button> : <div><button className="lj-inline-button" disabled={loading} onClick={refresh}>重新获取 ↻</button><SourceLink href="https://quote.eastmoney.com/ztb/detail#type=ztgc">查看来源股池</SourceLink></div>}</div>}
    <div className="lj-pool-bottom"><span>{pool?.summary ? `匹配 ${stocks.length} 只 / 股池 ${pool.summary.total} 只` : '涨停数据以来源股池为准'}{pool?.fetchedAt && ` · 获取于 ${stamp(pool.fetchedAt)}`}</span><div>{stocks.length > visible && <button className="lj-inline-button" onClick={() => setVisible(value => value + 20)}>展开更多 ↓</button>}<button className="lj-inline-button" disabled={!stocks.length || !pool?.tradeDate} onClick={() => pool?.tradeDate && exportCSV(stocks, pool.tradeDate)}>导出筛选结果 ↓</button></div></div>
    <p className="lj-source-note">{pool?.scope || '按东方财富涨停股池口径统计；不含ST、科创板及未开板新股。行业分类不等同于涨停原因。'} 连板与行业数量为该股池内统计，不据此推断资金流入或买卖机会。{snapshotMode ? '定时同步可能延迟，以显示的获取时间为准。' : '每60秒检查更新，盘中统计会变化。'}</p>
  </div></section>;
}
