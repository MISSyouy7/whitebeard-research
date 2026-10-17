/** @typedef {import('./market-types').MarketData} MarketData */

const CACHE_KEY = 'lujian:market-snapshot:v1';
const MAX_CACHE_AGE = 10 * 86400000;
const statuses = new Set(['ok', 'stale', 'empty', 'unavailable']);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string';
const timestamp = value => text(value) && /^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value) && day(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
const nullableTimestamp = value => value === null || timestamp(value);
const day = value => text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const url = value => text(value) && /^https?:\/\//.test(value);
const count = value => Number.isSafeInteger(value) && value >= 0;
const numberOrNull = value => value === null || (typeof value === 'number' && Number.isFinite(value));
const timeOrNull = value => value === null || (text(value) && /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value));
const source = value => object(value) && text(value.name) && url(value.url);
const hasNews = feed => (feed.status === 'ok' || feed.status === 'stale') && feed.items.length > 0;
const hasPool = feed => (feed.status === 'ok' || feed.status === 'stale') && feed.stocks.length > 0;
/** @param {MarketData} data @returns {MarketData} */
const retained = data => ({ ...data, news: { ...data.news, status: hasNews(data.news) ? 'stale' : data.news.status }, limitUp: { ...data.limitUp, status: hasPool(data.limitUp) ? 'stale' : data.limitUp.status } });

function emptyNews() {
  return { status: 'unavailable', source: { name: '财经快讯', url: 'https://kuaixun.eastmoney.com/' }, fetchedAt: null, latestAt: null, items: [] };
}
function emptyPool(tradeDate = null) {
  return { status: 'unavailable', source: { name: '涨停股池', url: 'https://quote.eastmoney.com/ztb/detail#type=ztgc' }, scope: '', fetchedAt: null, tradeDate, stocks: [], summary: null, sectors: [], ladder: [] };
}
function validNews(feed) {
  if (!object(feed) || !statuses.has(feed.status) || !source(feed.source) || !nullableTimestamp(feed.fetchedAt) || !nullableTimestamp(feed.latestAt) || !Array.isArray(feed.items)) return false;
  if (!feed.items.length) return feed.status === 'empty' || feed.status === 'unavailable';
  return hasNews(feed) && timestamp(feed.fetchedAt) && timestamp(feed.latestAt) && feed.items.every(item => object(item) && text(item.id) && text(item.title) && text(item.summary) && timestamp(item.publishedAt) && url(item.url) && typeof item.important === 'boolean' && text(item.source));
}
function validPool(feed) {
  if (!object(feed) || !statuses.has(feed.status) || !source(feed.source) || !text(feed.scope) || !nullableTimestamp(feed.fetchedAt) || !(feed.tradeDate === null || day(feed.tradeDate)) || !Array.isArray(feed.stocks) || !Array.isArray(feed.sectors) || !Array.isArray(feed.ladder)) return false;
  if (!feed.stocks.length) return (feed.status === 'empty' || feed.status === 'unavailable') && feed.summary === null && !feed.sectors.length && !feed.ladder.length;
  if (!hasPool(feed) || !timestamp(feed.fetchedAt) || !day(feed.tradeDate) || !object(feed.summary)) return false;
  if (!feed.stocks.every(stock => object(stock) && text(stock.code) && /^\d{6}$/.test(stock.code) && text(stock.name) && text(stock.industry) && Number.isSafeInteger(stock.boards) && stock.boards > 0 && ['price', 'change', 'turnover', 'sealAmount'].every(key => numberOrNull(stock[key])) && timeOrNull(stock.firstSeal) && timeOrNull(stock.lastSeal) && (stock.breaks === null || count(stock.breaks)) && url(stock.url))) return false;
  const { total, firstBoard, consecutive, highest } = feed.summary;
  return [total, firstBoard, consecutive, highest].every(count) && total === feed.stocks.length && firstBoard === feed.stocks.filter(stock => stock.boards === 1).length && consecutive === total - firstBoard && highest === Math.max(...feed.stocks.map(stock => stock.boards)) && feed.sectors.every(row => object(row) && text(row.name) && count(row.count)) && feed.ladder.every(row => object(row) && Number.isSafeInteger(row.boards) && row.boards > 0 && count(row.count)) && feed.sectors.reduce((sum, row) => sum + row.count, 0) === total && feed.ladder.reduce((sum, row) => sum + row.count, 0) === total;
}

/** Validate each feed independently so one broken feed cannot discard the other.
 * @param {unknown} value
 * @returns {MarketData}
 */
export function parseMarketData(value) {
  if (!object(value) || value.version !== 1 || !['live', 'snapshot'].includes(value.mode) || !nullableTimestamp(value.checkedAt) || !Number.isFinite(value.refreshSeconds) || value.refreshSeconds <= 0) throw new Error('Invalid market snapshot');
  const newsOK = validNews(value.news);
  const poolOK = validPool(value.limitUp);
  if (!newsOK && !poolOK) throw new Error('Invalid market feeds');
  return { ...value, news: newsOK ? value.news : emptyNews(), limitUp: poolOK ? value.limitUp : emptyPool() };
}

/** Prefer successful original timestamps, and the latest real trading date.
 * Fallback feeds are marked stale without changing when they were acquired.
 * @param {MarketData} primary
 * @param {MarketData | null} fallback
 * @param {{ requestedDate?: string }} options
 * @returns {MarketData}
 */
export function mergeMarketData(primary, fallback = null, { requestedDate = '' } = {}) {
  let news = primary.news;
  let limitUp = requestedDate && primary.limitUp.tradeDate !== requestedDate ? emptyPool(requestedDate) : primary.limitUp;
  if (fallback && hasNews(fallback.news) && (!hasNews(news) || Date.parse(fallback.news.fetchedAt) > Date.parse(news.fetchedAt))) news = { ...fallback.news, status: 'stale' };
  const previousPool = fallback?.limitUp;
  if (previousPool && hasPool(previousPool) && (!requestedDate || previousPool.tradeDate === requestedDate)) {
    const newerDate = previousPool.tradeDate > limitUp.tradeDate;
    const newerTime = previousPool.tradeDate === limitUp.tradeDate && Date.parse(previousPool.fetchedAt) > Date.parse(limitUp.fetchedAt);
    if (!hasPool(limitUp) || newerDate || newerTime) limitUp = { ...previousPool, status: 'stale' };
  }
  return { ...primary, news, limitUp };
}

/** Each endpoint owns its deadline, including JSON body reading. A parent abort
 * cancels the entire operation instead of accidentally starting a fallback.
 * @param {string} endpoint
 * @param {{ signal?: AbortSignal, timeoutMs?: number, fetcher?: typeof fetch }} options
 * @returns {Promise<MarketData>}
 */
export async function fetchMarketJSON(endpoint, { signal, timeoutMs = 6000, fetcher = fetch } = {}) {
  signal?.throwIfAborted();
  const controller = new AbortController();
  let rejectAbort;
  const aborted = new Promise((_, reject) => { rejectAbort = reject; });
  const stop = reason => { controller.abort(reason); rejectAbort(reason); };
  const parentAbort = () => stop(signal.reason || new DOMException('Aborted', 'AbortError'));
  signal?.addEventListener('abort', parentAbort, { once: true });
  const timer = setTimeout(() => stop(new DOMException('Market request timed out', 'TimeoutError')), timeoutMs);
  try {
    const request = (async () => {
      const response = await fetcher(endpoint, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`Market HTTP ${response.status}`);
      return parseMarketData(await response.json());
    })();
    return await Promise.race([request, aborted]);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', parentAbort);
  }
}

/** Anonymous site data only: public snapshots for Pages, same-origin API for
 * Workers. Historical queries never fall through to a latest-date snapshot.
 * @param {{ snapshotMode: boolean, snapshotURL: string, bundledURL: string, apiURL: string, requestedDate?: string, previous?: MarketData | null, signal?: AbortSignal, fetcher?: typeof fetch, remoteTimeoutMs?: number, bundledTimeoutMs?: number, apiTimeoutMs?: number, onSnapshot?: (data: MarketData) => void }} options
 * @returns {Promise<MarketData>}
 */
export async function loadClientMarket({ snapshotMode, snapshotURL, bundledURL, apiURL, requestedDate = '', previous = null, signal, fetcher = fetch, remoteTimeoutMs = 6000, bundledTimeoutMs = 4000, apiTimeoutMs = 22000, onSnapshot }) {
  signal?.throwIfAborted();
  let result = null;
  let failure;
  const useSnapshots = snapshotMode && !requestedDate;
  let primaryFinished = false;
  let earlySnapshot = null;
  // A first visitor can read the same-origin snapshot while a slow external
  // host connects. Reuse this request if that external host later fails.
  const earlyRequest = useSnapshots && !previous && onSnapshot
    ? fetchMarketJSON(bundledURL, { signal, fetcher, timeoutMs: bundledTimeoutMs }).then(data => {
      earlySnapshot = retained(data);
      if (!primaryFinished && !signal?.aborted) onSnapshot(earlySnapshot);
      return earlySnapshot;
    }).catch(() => null)
    : null;
  try {
    result = await fetchMarketJSON(useSnapshots ? snapshotURL : apiURL, { signal, fetcher, timeoutMs: useSnapshots ? remoteTimeoutMs : apiTimeoutMs });
  } catch (error) {
    signal?.throwIfAborted();
    failure = error;
  }
  primaryFinished = true;
  if (useSnapshots && (!result || !hasNews(result.news) || !hasPool(result.limitUp) || result.news.status === 'stale' || result.limitUp.status === 'stale')) {
    try {
      const bundled = earlyRequest ? await earlyRequest : await fetchMarketJSON(bundledURL, { signal, fetcher, timeoutMs: bundledTimeoutMs });
      if (bundled) result = result ? mergeMarketData(result, bundled) : retained(bundled);
    } catch (error) {
      signal?.throwIfAborted();
      failure = error;
    }
  }
  if (result && earlySnapshot) result = mergeMarketData(result, earlySnapshot);
  signal?.throwIfAborted();
  if (!result) {
    if (!previous) throw failure || new Error('Market unavailable');
    result = { ...previous, news: emptyNews(), limitUp: emptyPool(requestedDate || null) };
  }
  return mergeMarketData(result, previous, { requestedDate });
}

/** Cache only public latest-mode snapshots. Expiry uses acquisition timestamps,
 * never the time a visitor reloads or writes this cache.
 * @param {Storage | undefined} storage
 * @param {number} now
 * @returns {MarketData | null}
 */
export function readMarketCache(storage = undefined, now = Date.now()) {
  try {
    const raw = (storage || globalThis.localStorage)?.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = parseMarketData(JSON.parse(raw));
    if (data.mode !== 'snapshot') return null;
    const recent = value => value && now - Date.parse(value) >= -300000 && now - Date.parse(value) <= MAX_CACHE_AGE;
    const news = hasNews(data.news) && recent(data.news.fetchedAt) ? { ...data.news, status: 'stale' } : emptyNews();
    const limitUp = hasPool(data.limitUp) && recent(data.limitUp.fetchedAt) ? { ...data.limitUp, status: 'stale' } : emptyPool();
    return hasNews(news) || hasPool(limitUp) ? { ...data, news, limitUp } : null;
  } catch { return null; }
}

/** @param {MarketData} data @param {Storage | undefined} storage */
export function writeMarketCache(data, storage = undefined) {
  if (data.mode !== 'snapshot' || (!hasNews(data.news) && !hasPool(data.limitUp))) return;
  try { (storage || globalThis.localStorage)?.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* Private browsing and full storage must not block the dashboard. */ }
}
