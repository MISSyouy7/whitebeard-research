import { fetchNewsNow } from './newsnow-feeds.mjs';

// Public feeds. No cookies, account credentials, or private trading data are sent.
export const NEWS_SOURCE = { name: '东方财富 · 7×24快讯', url: 'https://kuaixun.eastmoney.com/' };
export const POOL_SOURCE = { name: '东方财富 · 涨停股池', url: 'https://quote.eastmoney.com/ztb/detail#type=ztgc' };
export const POOL_SCOPE = '按公开涨停股池收录范围统计，不代表全市场。行业为来源行业分类，不等同于涨停原因。';
const TTL = 60_000;
const clean = value => String(value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
const number = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);

export function shanghaiDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function validateDate(date, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('日期格式应为 YYYY-MM-DD');
  const value = new Date(`${date}T00:00:00Z`);
  const today = new Date(`${shanghaiDate(now)}T00:00:00Z`);
  if (!Number.isFinite(+value) || value.toISOString().slice(0, 10) !== date || value > today || +today - +value > 30 * 86400000) {
    throw new Error('请选择最近30天内的日期');
  }
  return date;
}

export function recentWeekdays(now = new Date()) {
  const days = [];
  const date = new Date(`${shanghaiDate(now)}T00:00:00Z`);
  // The exchange holiday calendar is not inferred from weekdays. Probe source
  // dates across the long-holiday window and always retain the actual data date.
  for (let i = 0; i < 16; i++, date.setUTCDate(date.getUTCDate() - 1)) {
    if (![0, 6].includes(date.getUTCDay())) days.push(date.toISOString().slice(0, 10));
  }
  return days;
}

function safeNewsUrl(raw, code) {
  try {
    const url = new URL(raw);
    if (url.protocol === 'https:' && (url.hostname === 'eastmoney.com' || url.hostname.endsWith('.eastmoney.com'))) return url.href;
  } catch {}
  return /^\d+$/.test(String(code)) ? `https://finance.eastmoney.com/a/${code}.html` : NEWS_SOURCE.url;
}

export function normalizeNews(payload, now = new Date()) {
  const rows = payload?.data?.fastNewsList;
  if (!Array.isArray(rows)) throw new Error('快讯数据结构异常');
  const seen = new Set();
  const items = rows.flatMap(row => {
    const title = clean(row.title || row.summary).slice(0, 300);
    const rawTime = String(row.showTime || row.updateTime || '');
    const time = Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/.test(rawTime) ? rawTime : rawTime.replace(' ', 'T') + '+08:00');
    const id = String(row.code || row.id || title);
    if (!title || !Number.isFinite(time) || time > +now + 300_000 || seen.has(id)) return [];
    seen.add(id);
    return [{ id, title, summary: clean(row.summary).slice(0, 600), publishedAt: new Date(time).toISOString(), url: safeNewsUrl(row.shareUrl || row.url, row.code), important: Number(row.titleColor) === 3 || row.titleColor === 'red', source: NEWS_SOURCE.name }];
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 40);
  if (rows.length && !items.length) throw new Error('快讯没有有效时间戳');
  return { status: 'ok', source: NEWS_SOURCE, fetchedAt: now.toISOString(), latestAt: items[0]?.publishedAt ?? null, items };
}

function clock(value) {
  const digits = String(value ?? '').padStart(6, '0');
  return /^\d{6}$/.test(digits) && Number(digits.slice(0, 2)) < 24 && Number(digits.slice(2, 4)) < 60 && Number(digits.slice(4)) < 60 && Number(digits) > 0 ? `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}` : null;
}

function sourceTradeDate(value, now) {
  if (value === null || value === undefined) return null;
  const digits = String(value);
  if (!/^\d{8}$/.test(digits)) throw new Error('涨停数据交易日异常');
  const date = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(+parsed) || parsed.toISOString().slice(0, 10) !== date || date > shanghaiDate(now)) {
    throw new Error('涨停数据交易日异常');
  }
  return date;
}

function stockUrl(code, market) {
  // Beijing shares also have Eastmoney market id 0. Their code prefix, not that
  // id, distinguishes them from Shenzhen shares in the human-facing quote URL.
  const exchange = /^(?:4|8|92)/.test(code) ? 'bj' : Number(market) === 1 || /^6/.test(code) ? 'sh' : 'sz';
  return `https://quote.eastmoney.com/${exchange}${code}.html`;
}

export function normalizePool(payload, date, now = new Date()) {
  if (payload?.rc !== undefined && Number(payload.rc) !== 0) throw new Error('涨停数据源返回错误');
  if (payload?.data === null) return null;
  const rows = payload?.data?.pool;
  if (!Array.isArray(rows)) throw new Error('涨停数据结构异常');
  // qdate is the source's latest trading day, including on historical queries.
  // For later dates the source can silently return that latest day's pool.
  const latestDate = sourceTradeDate(payload.data.qdate, now);
  const tradeDate = latestDate && latestDate < date ? latestDate : date;
  // Empty pools can be a holiday or not-yet-published day, not proof of zero stocks.
  if (!rows.length) return null;
  const seen = new Set();
  const stocks = rows.map(row => {
    const code = String(row.c ?? '');
    const boards = number(row.lbc);
    if (!/^\d{6}$/.test(code) || !clean(row.n) || !Number.isInteger(boards) || boards < 1 || seen.has(code)) throw new Error('涨停记录不完整或重复');
    seen.add(code);
    return { code, name: clean(row.n), industry: clean(row.hybk) || '未分类', boards, price: number(row.p) === null ? null : number(row.p) / 1000, change: number(row.zdp), turnover: number(row.hs), sealAmount: number(row.fund), firstSeal: clock(row.fbt), lastSeal: clock(row.lbt), breaks: number(row.zbc), url: stockUrl(code, row.m) };
  }).sort((a, b) => b.boards - a.boards || (a.firstSeal || '').localeCompare(b.firstSeal || '') || a.code.localeCompare(b.code));
  const declared = number(payload.data.tc);
  if (declared !== null && declared !== stocks.length) throw new Error('涨停股池分页不完整');
  const sectorMap = new Map();
  const ladderMap = new Map();
  for (const stock of stocks) {
    sectorMap.set(stock.industry, (sectorMap.get(stock.industry) || 0) + 1);
    ladderMap.set(stock.boards, (ladderMap.get(stock.boards) || 0) + 1);
  }
  return { status: 'ok', source: POOL_SOURCE, scope: POOL_SCOPE, fetchedAt: now.toISOString(), tradeDate, stocks,
    summary: { total: stocks.length, firstBoard: stocks.filter(s => s.boards === 1).length, consecutive: stocks.filter(s => s.boards > 1).length, highest: Math.max(...stocks.map(s => s.boards)) },
    sectors: [...sectorMap].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    ladder: [...ladderMap].map(([boards, count]) => ({ boards, count })).sort((a, b) => b.boards - a.boards),
  };
}

async function fetchJson(url, fetcher, timeout = 6500) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('数据源请求超时'));
    }, timeout);
  });
  try {
    // The deadline also covers response-body parsing and injected fetchers that
    // do not implement AbortSignal, so a stalled source cannot hold all feeds.
    return await Promise.race([deadline, (async () => {
      const response = await fetcher(url, { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0', Referer: 'https://quote.eastmoney.com/' }, signal: controller.signal });
      if (!response.ok) throw new Error(`数据源 HTTP ${response.status}`);
      return response.json();
    })()]);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchNews(fetcher = fetch, now = new Date()) {
  const url = new URL('https://np-weblist.eastmoney.com/comm/web/getFastNewsList');
  url.search = new URLSearchParams({ client: 'web', biz: 'web_724', fastColumn: '102', sortEnd: '', pageSize: '40', req_trace: '1' }).toString();
  try {
    const primary = normalizeNews(await fetchJson(url, fetcher), now);
    // A successful HTTP response can still be an old upstream cache. Apply the
    // same freshness boundary as the backup before replacing a useful snapshot.
    if (primary.items.length && +now - Date.parse(primary.latestAt) <= 24 * 60 * 60 * 1000) return primary;
  } catch {
    // One primary request (6.5s) plus the bounded NewsNow chain (8s) stays under
    // the client's 22s deadline; pool requests run independently in parallel.
  }
  const backup = await fetchNewsNow(fetcher, now);
  if (!backup.items?.length) throw new Error('快讯暂无可用内容');
  return backup;
}

function emptyPool(now, requestedDate, latestDate = '') {
  const message = latestDate
    ? `该日暂无已发布的涨停股池，最近可用交易日为 ${latestDate}。`
    : requestedDate ? '该日暂无涨停股池，可能休市或数据尚未发布。' : '近期暂无可用涨停股池，请稍后刷新。';
  return { status: 'empty', source: POOL_SOURCE, scope: POOL_SCOPE, fetchedAt: now.toISOString(), tradeDate: requestedDate || null, stocks: [], summary: null, sectors: [], ladder: [], message };
}

export async function fetchPool(fetcher = fetch, now = new Date(), requestedDate = '') {
  const started = Date.now();
  const dates = requestedDate ? [validateDate(requestedDate, now)] : recentWeekdays(now);
  for (const date of dates) {
    const remaining = 18000 - (Date.now() - started);
    if (remaining <= 0) throw new Error('涨停数据查询超时');
    const url = new URL('https://push2ex.eastmoney.com/getTopicZTPool');
    url.search = new URLSearchParams({ ut: '7eea3edcaed734bea9cbfc24409ed989', dpt: 'wz.ztzt', Pageindex: '0', pagesize: '10000', sort: 'fbt:asc', date: date.replaceAll('-', '') }).toString();
    const pool = normalizePool(await fetchJson(url, fetcher, Math.min(6500, remaining)), date, now);
    if (pool) {
      if (requestedDate && pool.tradeDate !== requestedDate) return emptyPool(now, requestedDate, pool.tradeDate);
      return pool;
    }
  }
  return emptyPool(now, requestedDate);
}

export function unavailable(kind) {
  return kind === 'news'
    ? { status: 'unavailable', source: NEWS_SOURCE, fetchedAt: null, latestAt: null, items: [], message: '快讯暂时未能更新，可前往来源查看。' }
    : { status: 'unavailable', source: POOL_SOURCE, scope: POOL_SCOPE, fetchedAt: null, tradeDate: null, stocks: [], summary: null, sectors: [], ladder: [], message: '涨停数据暂时未能更新，可前往来源查看。' };
}

export function fallback(previous, kind) {
  // Never refresh the successful timestamp when an upstream request fails.
  return previous?.fetchedAt && (kind === 'news' ? previous.items?.length : previous.stocks?.length)
    ? { ...previous, status: 'stale', message: '更新暂不可用，当前为上次成功获取的数据。' }
    : unavailable(kind);
}

export async function loadMarket({ fetcher = fetch, now = new Date(), date = '', previous = null } = {}) {
  if (date) validateDate(date, now);
  const [news, pool] = await Promise.allSettled([fetchNews(fetcher, now), fetchPool(fetcher, now, date)]);
  const previousPool = !date || previous?.limitUp?.tradeDate === date ? previous?.limitUp : null;
  // A newly empty source response is not evidence that previously confirmed
  // stocks disappeared. Keep the original successful date/time when possible.
  const preservePool = pool.status === 'rejected' || pool.value.status === 'empty' && previousPool?.stocks?.length;
  return { version: 1, mode: 'live', checkedAt: now.toISOString(), refreshSeconds: 60,
    news: news.status === 'fulfilled' ? news.value : fallback(previous?.news, 'news'),
    limitUp: preservePool ? fallback(previousPool, 'pool') : pool.value };
}

// Coalesce simultaneous visitors. Failed refreshes retry after 15s; bounded cache.
export function createMarketService(loader = loadMarket) {
  const cache = new Map();
  let latestResult = null;
  return async (date = '', now = new Date()) => {
    if (date) validateDate(date, now);
    const key = date || `latest:${shanghaiDate(now)}`;
    const cached = cache.get(key);
    if (cached?.pending) return cached.pending;
    if (cached && cached.until > +now) return cached.value;
    // The latest key rolls over at Shanghai midnight. Keep the last response as
    // a fallback across that boundary without leaking it into date queries.
    const previous = cached?.value ?? (!date ? latestResult?.value : undefined);
    const pending = loader({ date, now, previous }).then(value => {
      const failed = value.news.status !== 'ok' || !['ok', 'empty'].includes(value.limitUp.status);
      cache.set(key, { value, until: +now + (failed ? 15000 : TTL) });
      if (!date && (!latestResult || +now >= latestResult.at)) latestResult = { at: +now, value };
      if (cache.size > 32) cache.delete(cache.keys().next().value);
      return value;
    }).catch(error => { cache.delete(key); throw error; });
    cache.set(key, { ...cached, pending });
    return pending;
  };
}

const service = createMarketService();
export async function marketAPI(request) {
  const url = new URL(request.url);
  if (url.pathname.replace(/\/$/, '') !== '/api/market') return null;
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
  if (request.method !== 'GET') return json({ error: '仅支持 GET' }, 405);
  const date = url.searchParams.get('date') || '';
  try { if (date) validateDate(date); } catch (error) { return json({ error: error.message }, 400); }
  try { return json(await service(date)); }
  catch { return json({ error: '行情服务暂不可用' }, 503); }
}
