import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchMarketJSON, loadClientMarket, mergeMarketData, parseMarketData, readMarketCache, writeMarketCache } from '../lib/market-client.mjs';

const acquired = '2026-10-18T02:00:00.000Z';
// Contract fixtures only: never bundled into the public snapshot.
const fixture = () => ({
  version: 1, mode: 'snapshot', checkedAt: acquired, refreshSeconds: 900,
  news: { status: 'ok', source: { name: '测试快讯', url: 'https://example.com/news' }, fetchedAt: acquired, latestAt: '2026-10-18T01:50:00.000Z', items: [
    { id: 'fixture-1', title: '测试快讯', summary: '测试摘要', publishedAt: '2026-10-18T01:50:00.000Z', url: 'https://example.com/news/1', important: false, source: '测试快讯' },
  ] },
  limitUp: { status: 'ok', source: { name: '测试股池', url: 'https://example.com/pool' }, scope: '测试股池', fetchedAt: acquired, tradeDate: '2026-10-16', summary: { total: 1, firstBoard: 1, consecutive: 0, highest: 1 }, stocks: [
    { code: '000001', name: '测试股票', industry: '测试行业', boards: 1, price: 10, change: 10, turnover: null, sealAmount: null, firstSeal: '09:30:00', lastSeal: null, breaks: 0, url: 'https://example.com/stock/000001' },
  ], sectors: [{ name: '测试行业', count: 1 }], ladder: [{ boards: 1, count: 1 }] },
});
const missingNews = data => { data.news = { ...data.news, status: 'unavailable', fetchedAt: null, latestAt: null, items: [] }; return data; };
const missingPool = data => { data.limitUp = { ...data.limitUp, status: 'unavailable', fetchedAt: null, tradeDate: null, summary: null, stocks: [], sectors: [], ladder: [] }; return data; };
const json = value => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });
const options = { snapshotMode: true, snapshotURL: 'https://example.com/remote.json', bundledURL: '/data/market.json', apiURL: '/api/market' };

test('healthy public snapshots need only one anonymous request', async () => {
  const calls = [];
  const result = await loadClientMarket({ ...options, fetcher: async (url, settings) => { calls.push({ url, settings }); return json(fixture()); } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, options.snapshotURL);
  assert.equal(calls[0].settings.cache, 'no-store');
  assert.equal(calls[0].settings.headers, undefined);
  assert.equal(result.news.status, 'ok');
  assert.equal(result.limitUp.status, 'ok');
});

test('HTTP errors, HTML, invalid JSON and invalid snapshot schemas all use the bundled fallback', async () => {
  const responses = [
    () => new Response('unavailable', { status: 503 }),
    () => new Response('<html>Access denied</html>'),
    () => new Response('{ broken'),
    () => json({ version: 1, news: { items: [] }, limitUp: { stocks: [] } }),
  ];
  for (const response of responses) {
    const calls = [];
    const result = await loadClientMarket({ ...options, fetcher: async url => { calls.push(url); return url === options.snapshotURL ? response() : json(fixture()); } });
    assert.deepEqual(calls, [options.snapshotURL, options.bundledURL]);
    assert.equal(result.news.items.length, 1);
    assert.equal(result.news.status, 'stale');
    assert.equal(result.news.fetchedAt, acquired);
    assert.equal(result.limitUp.tradeDate, '2026-10-16');
  }
});

test('partial snapshots preserve current news and recover only the missing stock pool', async () => {
  const remote = missingPool(fixture());
  remote.news.fetchedAt = '2026-10-18T03:00:00.000Z';
  const result = await loadClientMarket({ ...options, fetcher: async url => json(url === options.snapshotURL ? remote : fixture()) });
  assert.equal(result.news.status, 'ok');
  assert.equal(result.news.fetchedAt, remote.news.fetchedAt);
  assert.equal(result.limitUp.status, 'stale');
  assert.equal(result.limitUp.fetchedAt, acquired);
  assert.equal(result.limitUp.tradeDate, '2026-10-16');
});

test('malformed timestamps or required arrays cannot reach components and do not discard the other feed', async () => {
  const remote = fixture();
  remote.news.items[0].publishedAt = 'not-a-date';
  remote.limitUp.fetchedAt = '2026-10-18T03:00:00.000Z';
  const result = await loadClientMarket({ ...options, fetcher: async url => json(url === options.snapshotURL ? remote : fixture()) });
  assert.equal(result.news.status, 'stale');
  assert.equal(result.news.items[0].publishedAt, fixture().news.items[0].publishedAt);
  assert.equal(result.limitUp.status, 'ok');
  assert.equal(result.limitUp.fetchedAt, remote.limitUp.fetchedAt);
  for (const key of ['stocks', 'sectors', 'ladder']) {
    const bad = fixture();
    bad.limitUp[key] = null;
    const parsed = parseMarketData(bad);
    assert.equal(parsed.limitUp.status, 'unavailable');
    assert.deepEqual(parsed.limitUp.stocks, []);
    assert.equal(parsed.news.status, 'ok');
  }
  const badTop = fixture();
  badTop.checkedAt = 'tomorrow';
  assert.throws(() => parseMarketData(badTop));
});

test('successful acquisition times and actual pool dates win over later checks of old data', async () => {
  const remote = missingNews(fixture());
  remote.checkedAt = '2026-10-18T04:00:00.000Z';
  remote.limitUp.fetchedAt = '2026-10-18T04:00:00.000Z';
  remote.limitUp.tradeDate = '2026-10-15';
  const bundled = fixture();
  const result = await loadClientMarket({ ...options, fetcher: async url => json(url === options.snapshotURL ? remote : bundled) });
  assert.equal(result.checkedAt, remote.checkedAt);
  assert.equal(result.limitUp.tradeDate, '2026-10-16');
  assert.equal(result.limitUp.fetchedAt, acquired);
  assert.equal(result.news.fetchedAt, acquired);
  assert.equal(result.news.latestAt, bundled.news.latestAt);
  const newerPrevious = fixture();
  newerPrevious.news.fetchedAt = '2026-10-18T05:00:00.000Z';
  const merged = mergeMarketData(result, newerPrevious);
  assert.equal(merged.news.fetchedAt, newerPrevious.news.fetchedAt);
  assert.equal(merged.news.status, 'stale');
});

test('a stalled request has its own deadline and the fallback receives a fresh signal', async () => {
  let remoteSignal;
  let fallbackSignal;
  const result = await loadClientMarket({ ...options, remoteTimeoutMs: 5, bundledTimeoutMs: 100, fetcher: async (url, { signal }) => {
    if (url === options.snapshotURL) { remoteSignal = signal; return new Promise(() => {}); }
    fallbackSignal = signal;
    return json(fixture());
  } });
  assert.equal(remoteSignal.aborted, true);
  assert.equal(fallbackSignal.aborted, false);
  assert.notEqual(remoteSignal, fallbackSignal);
  assert.equal(result.limitUp.stocks.length, 1);
});

test('first visitors see the bundled snapshot immediately while the remote request continues', async () => {
  const calls = [];
  let resolveRemote;
  let early;
  const pending = loadClientMarket({ ...options, onSnapshot: data => { early = data; }, fetcher: async url => {
    calls.push(url);
    if (url === options.bundledURL) return json(fixture());
    return new Promise(resolve => { resolveRemote = resolve; });
  } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(early.news.status, 'stale');
  assert.equal(early.news.fetchedAt, acquired);
  assert.equal(early.limitUp.stocks.length, 1);
  const current = fixture();
  current.news.fetchedAt = '2026-10-18T03:00:00.000Z';
  resolveRemote(json(current));
  const result = await pending;
  assert.equal(result.news.status, 'ok');
  assert.equal(result.news.fetchedAt, current.news.fetchedAt);
  assert.equal(calls.length, 2);
});

test('an early bundled request is reused on remote failure and cannot overwrite a completed response', async () => {
  let earlyCount = 0;
  const calls = [];
  const result = await loadClientMarket({ ...options, remoteTimeoutMs: 5, onSnapshot: () => { earlyCount++; }, fetcher: async url => {
    calls.push(url);
    return url === options.bundledURL ? json(fixture()) : new Promise(() => {});
  } });
  assert.equal(earlyCount, 1);
  assert.equal(calls.length, 2);
  assert.equal(result.news.fetchedAt, acquired);
  let resolveBundle;
  let lateCallback = false;
  const live = await loadClientMarket({ ...options, onSnapshot: () => { lateCallback = true; }, fetcher: async url => {
    if (url === options.snapshotURL) return json(fixture());
    return new Promise(resolve => { resolveBundle = resolve; });
  } });
  assert.equal(live.news.status, 'ok');
  resolveBundle(json(fixture()));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(lateCallback, false);
});

test('the endpoint deadline includes JSON body reads, and a second timeout preserves previous data', async () => {
  let signal;
  await assert.rejects(fetchMarketJSON('/stalled-body', { timeoutMs: 5, fetcher: async (_url, options) => {
    signal = options.signal;
    return { ok: true, json: () => new Promise(() => {}) };
  } }), { name: 'TimeoutError' });
  assert.equal(signal.aborted, true);
  const previous = fixture();
  const result = await loadClientMarket({ ...options, previous, remoteTimeoutMs: 5, bundledTimeoutMs: 5, fetcher: () => new Promise(() => {}) });
  assert.equal(result.news.status, 'stale');
  assert.equal(result.news.fetchedAt, acquired);
  assert.equal(result.limitUp.fetchedAt, acquired);
});

test('parent abort cancels loading without attempting a fallback or returning cached data', async () => {
  const controller = new AbortController();
  const calls = [];
  const pending = loadClientMarket({ ...options, signal: controller.signal, previous: fixture(), fetcher: async url => { calls.push(url); return new Promise(() => {}); } });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.deepEqual(calls, [options.snapshotURL]);
  await assert.rejects(loadClientMarket({ ...options, signal: controller.signal, fetcher: async () => { throw new Error('must not run'); } }), { name: 'AbortError' });
});

test('historical dates use only the API and cannot inherit another day from snapshots or cache', async () => {
  const requestedDate = '2026-10-15';
  const previous = fixture();
  const calls = [];
  const result = await loadClientMarket({ ...options, requestedDate, apiURL: `/api/market?date=${requestedDate}`, previous, fetcher: async url => { calls.push(url); throw new Error('offline'); } });
  assert.deepEqual(calls, [`/api/market?date=${requestedDate}`]);
  assert.equal(result.limitUp.status, 'unavailable');
  assert.equal(result.limitUp.tradeDate, requestedDate);
  assert.deepEqual(result.limitUp.stocks, []);
  assert.equal(result.news.status, 'stale');
  const wrongDate = await loadClientMarket({ ...options, snapshotMode: false, requestedDate, fetcher: async () => json(fixture()) });
  assert.deepEqual(wrongDate.limitUp.stocks, []);
  assert.equal(wrongDate.limitUp.tradeDate, requestedDate);
  previous.limitUp.tradeDate = requestedDate;
  const sameDate = await loadClientMarket({ ...options, snapshotMode: false, requestedDate, previous, fetcher: async () => { throw new Error('offline'); } });
  assert.equal(sameDate.limitUp.stocks.length, 1);
  assert.equal(sameDate.limitUp.status, 'stale');
  assert.equal(sameDate.limitUp.fetchedAt, acquired);
});

test('a local snapshot survives reload as stale and expires by each original acquisition time', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const data = fixture();
  writeMarketCache(data, storage);
  const restored = readMarketCache(storage, Date.parse(acquired) + 86400000);
  assert.equal(restored.news.status, 'stale');
  assert.equal(restored.limitUp.status, 'stale');
  assert.equal(restored.news.fetchedAt, acquired);
  assert.equal(restored.limitUp.tradeDate, data.limitUp.tradeDate);
  assert.equal(readMarketCache(storage, Date.parse(acquired) + 11 * 86400000), null);
  data.news.fetchedAt = '2026-10-01T02:00:00.000Z';
  writeMarketCache(data, storage);
  const partial = readMarketCache(storage, Date.parse(acquired));
  assert.equal(partial.news.status, 'unavailable');
  assert.equal(partial.limitUp.status, 'stale');
  writeMarketCache({ ...fixture(), mode: 'live' }, storage);
  assert.equal(readMarketCache(storage, Date.parse(acquired)).news.status, 'unavailable');
});

test('blocked, malformed and future-dated browser storage never prevents site loading', () => {
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };
  assert.equal(readMarketCache(blocked), null);
  assert.doesNotThrow(() => writeMarketCache(fixture(), blocked));
  assert.equal(readMarketCache({ getItem: () => 'not JSON' }), null);
  assert.equal(readMarketCache({ getItem: () => JSON.stringify(fixture()) }, Date.parse(acquired) - 86400000), null);
});
