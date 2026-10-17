'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { MarketData, LimitStock } from '../../lib/market-types';
import { SectionTitle } from './site-chrome';
import { FeedState, LoadingRows, SourceLink, change, feedIsOld, money, snapshotMode, stamp } from './market-ui';

type Props = { data: MarketData | null; loading: boolean; refresh: () => void; requestedDate: string; setRequestedDate: (date: string) => void; today: string };
const boardName = (boards: number) => boards === 1 ? '首板' : `${boards}连板`;
function exportCSV(stocks: LimitStock[], date: string) {
  const cell = (value: string | number | null) => '"' + String(value ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""') + '"';
  const rows = [['交易日期', '代码', '名称', '行业', '连板数', '涨幅(%)', '首次封板', '封单金额(元)', '炸板次数'], ...stocks.map(stock => [date, stock.code, stock.name, stock.industry, stock.boards, stock.change, stock.firstSeal, stock.sealAmount, stock.breaks])];
  const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `路见资本-涨停股池-${date}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function LimitSection({ data, loading, refresh, requestedDate, setRequestedDate, today }: Props) {
  const [tab, setTab] = useState('全部');
  const [boardLevel, setBoardLevel] = useState<number | null>(null);
  const [industry, setIndustry] = useState('全部行业');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('boards');
  const [visible, setVisible] = useState(8);
  const [dateError, setDateError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const pool = data?.limitUp;
  const stocks = (pool?.stocks || []).filter(stock => (boardLevel === null || stock.boards === boardLevel) && (tab === '全部' || (tab === '首板' ? stock.boards === 1 : stock.boards > 1)) && (industry === '全部行业' || stock.industry === industry) && `${stock.name} ${stock.code}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === 'time' ? (a.firstSeal || '99').localeCompare(b.firstSeal || '99') : b.boards - a.boards || (b.sealAmount || 0) - (a.sealAmount || 0));
  const hasFilters = tab !== '全部' || boardLevel !== null || industry !== '全部行业' || !!query;
  const reset = () => { setTab('全部'); setBoardLevel(null); setIndustry('全部行业'); setQuery(''); setVisible(8); setAnnouncement(''); };
  const minDate = today ? new Date(Date.parse(today + 'T00:00:00Z') - 30 * 86400000).toISOString().slice(0, 10) : '';
  const stats = [['涨停家数', pool?.summary?.total, '只'], ['首板', pool?.summary?.firstBoard, '只'], ['连板', pool?.summary?.consecutive, '只'], ['最高连板', pool?.summary?.highest, '板']] as const;
  const stale = pool?.fetchedAt && (pool.status === 'stale' || feedIsOld(pool.fetchedAt, data?.mode || 'live'));

  return <section className="lj-limit-section" id="limit-up" aria-labelledby="limit-title"><div className="lj-wrap">
    <SectionTitle index="02" english="A-SHARE / DAILY REVIEW" title="涨停复盘" id="limit-title"><div className="lj-limit-controls"><FeedState status={pool?.status} at={pool?.fetchedAt} mode={data?.mode} loading={loading} /><button className="lj-refresh" onClick={refresh} disabled={loading} aria-label="刷新涨停复盘">↻ 刷新</button></div></SectionTitle>
    <div className="lj-review-dateline"><div><span>数据对应日期</span><strong>{pool?.tradeDate || requestedDate || '待获取'}</strong>{pool?.tradeDate && <small>{pool.tradeDate === today ? '当日股池 · 盘中会变化' : '历史交易日 · 非今日行情'}</small>}</div>
      {!snapshotMode && <label className="lj-date-picker"><span>切换日期</span><input aria-label="涨停复盘日期" aria-describedby={dateError ? 'date-error' : undefined} aria-invalid={!!dateError} type="date" min={minDate} max={today} value={requestedDate || pool?.tradeDate || ''} onChange={event => {
        if (!event.currentTarget.validity.valid) { setDateError('请选择最近30天内的日期'); return; }
        setDateError(''); reset(); setRequestedDate(event.target.value);
      }} /></label>}
      {requestedDate && <button className="lj-inline-button" onClick={() => { reset(); setDateError(''); setRequestedDate(''); }}>返回最近可用日</button>}
    </div>
    {dateError && <p id="date-error" className="lj-data-notice" role="alert">{dateError}</p>}
    {stale && <p className="lj-data-notice">更新暂不可用。当前保留 {stamp(pool.fetchedAt)} 获取的股池，请以该时间为准。</p>}
    {pool?.summary ? <>
      <div className="lj-stat-grid">{stats.map(([label, value, unit]) => <div key={label}><span>{label}</span><strong>{value}<small>{unit}</small></strong></div>)}</div>
      <div className="lj-market-structure"><div><h3>连板梯队 <small>点击查看对应股票</small></h3><div className="lj-ladder">{pool.ladder.map(level => <button key={level.boards} aria-pressed={boardLevel === level.boards} onClick={() => { setBoardLevel(boardLevel === level.boards ? null : level.boards); setTab('全部'); setVisible(8); }}><b>{level.boards === 1 ? '首板' : `${level.boards}板`}</b><span style={{ width: `${Math.max(8, level.count / pool.summary!.total * 100)}%` }} /><strong>{level.count}<small>只</small></strong></button>)}</div></div>
        <div><h3>行业分布 <small>点击筛选 · 按股池数量</small></h3><div className="lj-sectors">{pool.sectors.slice(0, 6).map(sector => <button key={sector.name} aria-pressed={industry === sector.name} onClick={() => { setIndustry(industry === sector.name ? '全部行业' : sector.name); setVisible(8); }}><span>{sector.name}</span><b>{sector.count}<small>只</small></b></button>)}</div></div>
      </div>
      <div className="lj-pool-tools">
        <div className="lj-tabs" aria-label="涨停类型">{['全部', '首板', '连板'].map(item => <button key={item} aria-pressed={tab === item && boardLevel === null} onClick={() => { setTab(item); setBoardLevel(null); setVisible(8); }}>{item}</button>)}</div>
        <label className="lj-search lj-stock-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="搜索涨停股票" value={query} onChange={event => { setQuery(event.target.value); setVisible(8); }} placeholder="输入股票名称 / 代码" />{query && <button className="lj-clear-input" onClick={() => setQuery('')} aria-label="清空股票搜索">×</button>}</label>
        <div className="lj-pool-filters"><label><span className="sr-only">筛选行业</span><select value={industry} onChange={event => { setIndustry(event.target.value); setVisible(8); }}><option>全部行业</option>{pool.sectors.map(sector => <option key={sector.name}>{sector.name}</option>)}</select></label><label><span className="sr-only">排序方式</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="boards">连板高度优先</option><option value="time">首次封板时间</option></select></label></div>
      </div>
      <div className="lj-filter-feedback" id="limit-results"><span role="status">找到 <strong>{stocks.length}</strong> 只 / 共 {pool.summary.total} 只</span><div className="lj-filter-chips">
        {tab !== '全部' && <button aria-label={`移除${tab}筛选`} onClick={() => setTab('全部')}>{tab} <span aria-hidden="true">×</span></button>}
        {boardLevel !== null && <button aria-label="移除连板高度筛选" onClick={() => setBoardLevel(null)}>{boardName(boardLevel)} <span aria-hidden="true">×</span></button>}
        {industry !== '全部行业' && <button aria-label="移除行业筛选" onClick={() => setIndustry('全部行业')}>{industry} <span aria-hidden="true">×</span></button>}
        {query && <button aria-label="移除关键词筛选" onClick={() => setQuery('')}>“{query}” <span aria-hidden="true">×</span></button>}
        {hasFilters && <button className="lj-reset-filters" onClick={reset}>重置筛选</button>}
      </div></div>
      {stocks.length > 0 ? <>
        <div className="lj-table-scroll lj-desktop-stocks" role="region" aria-label="涨停股池明细" tabIndex={0}><table className="lj-pool-table"><caption className="sr-only">{pool.tradeDate} 涨停股池筛选结果</caption><thead><tr><th scope="col">股票 / 代码</th><th scope="col">行业</th><th scope="col">连板</th><th scope="col">涨幅</th><th scope="col">首次封板</th><th scope="col">封单金额</th><th scope="col">炸板次数</th></tr></thead><tbody>{stocks.slice(0, visible).map(stock => <tr key={stock.code}><td><a href={stock.url} target="_blank" rel="noopener noreferrer"><strong>{stock.name} <span aria-hidden="true">↗</span></strong><small>{stock.code}</small></a></td><td>{stock.industry}</td><td><BoardBadge boards={stock.boards} /></td><td className="lj-rise">{change(stock.change)}</td><td className="lj-mono">{stock.firstSeal || '—'}</td><td className="lj-mono">{money(stock.sealAmount)}</td><td className="lj-mono">{stock.breaks ?? '—'}</td></tr>)}</tbody></table></div>
        <ol className="lj-mobile-stocks" aria-label="涨停股票列表">{stocks.slice(0, visible).map(stock => <StockCard key={stock.code} stock={stock} />)}</ol>
      </> : <div className="lj-pool-empty"><h3>没有匹配的股票</h3><p>当前条件已显示在上方，可单独移除，也可重置全部筛选。</p><button className="lj-button lj-button-outline" onClick={reset}>清除筛选</button></div>}
      <div className="lj-pool-bottom"><span>已展示 {Math.min(visible, stocks.length)} 只{pool.fetchedAt && ` · 获取于 ${stamp(pool.fetchedAt)}`}</span><div>{stocks.length > visible && <button className="lj-inline-button" onClick={() => setVisible(value => value + 20)}>再看 {Math.min(20, stocks.length - visible)} 只 ↓</button>}<button className="lj-inline-button" disabled={!stocks.length || !pool.tradeDate} onClick={() => { if (pool.tradeDate) { exportCSV(stocks, pool.tradeDate); setAnnouncement(`已生成 ${stocks.length} 条筛选结果的 CSV 文件`); } }}>导出筛选结果 ↓</button></div></div><p className="lj-export-feedback" role="status">{announcement}</p>
    </> : loading ? <LoadingRows label="正在获取涨停股池" /> : <div className="lj-pool-empty lj-pool-unavailable"><div><span className="lj-kicker">连板梯队 / 行业分布 / 个股筛选</span><h3>{pool?.status === 'empty' ? '所选日期暂无股池' : '涨停数据暂时不可用'}</h3><p>{pool?.status === 'empty' ? '可能处于休市日或来源尚未发布。可切换日期或查看来源。' : '当前不展示行情数字。你可以重试连接，也可以直接查看来源股池。'}</p></div><div className="lj-empty-actions"><button className="lj-button lj-button-outline" onClick={refresh}>重新连接 ↻</button><SourceLink href="https://quote.eastmoney.com/ztb/detail#type=ztgc">查看来源股池</SourceLink><Link className="lj-text-link" href="/research/">先读历史研究 →</Link></div></div>}
    <details className="lj-data-method"><summary>数据来源与统计口径 <span aria-hidden="true">＋</span></summary><p>{pool?.scope || '按东方财富涨停股池口径统计；不含ST、科创板及未开板新股。行业分类不等同于涨停原因。'} 连板与行业数量为该股池内统计，不据此推断资金流入或买卖机会。{snapshotMode ? '定时同步可能延迟，以获取时间为准。' : '每60秒检查更新，盘中统计会变化。'}</p></details>
  </div></section>;
}

function BoardBadge({ boards }: { boards: number }) {
  return <span className={`lj-board-badge${boards > 1 ? ' is-high' : ''}`}>{boardName(boards)}</span>;
}
function StockCard({ stock }: { stock: LimitStock }) {
  return <li className="lj-stock-card"><div className="lj-stock-card-head"><a href={stock.url} target="_blank" rel="noopener noreferrer"><strong>{stock.name} <span aria-hidden="true">↗</span></strong><small>{stock.code} · {stock.industry}</small></a><div><strong className="lj-rise">{change(stock.change)}</strong><BoardBadge boards={stock.boards} /></div></div>
    <dl><div><dt>首次封板</dt><dd>{stock.firstSeal || '—'}</dd></div><div><dt>封单金额</dt><dd>{money(stock.sealAmount)}</dd></div></dl>
    <details><summary>更多交易数据 <span aria-hidden="true">＋</span></summary><dl><div><dt>最新价</dt><dd>{stock.price === null ? '—' : `¥ ${stock.price.toFixed(2)}`}</dd></div><div><dt>换手率</dt><dd>{stock.turnover === null ? '—' : `${stock.turnover.toFixed(2)}%`}</dd></div><div><dt>最后封板</dt><dd>{stock.lastSeal || '—'}</dd></div><div><dt>炸板次数</dt><dd>{stock.breaks ?? '—'}</dd></div></dl></details>
  </li>;
}
