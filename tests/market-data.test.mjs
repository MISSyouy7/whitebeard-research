import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeNews, normalizePool, loadMarket, createMarketService, validateDate, recentWeekdays, marketAPI } from '../server/market-data.mjs';
const now = new Date('2026-10-18T02:00:00Z');
// Synthetic contract fixtures are only used by tests, never by the public site.
const newsPayload = { data: { fastNewsList: [
  { code: '1', title: '<b>测试政策快讯</b>', summary: '测试摘要', showTime: '2026-10-18 09:10:00', shareUrl: 'javascript:alert(1)', titleColor: 3 },
  { code: '2', title: '测试产业快讯', showTime: '2026-10-18 09:20:00', shareUrl: 'https://finance.eastmoney.com/a/2.html' },
  { code: '2', title: '重复', showTime: '2026-10-18 09:20:00' },
  { code: '3', title: '未来条目', showTime: '2026-10-19 09:20:00' },
] } };
const stock = (c, lbc, hybk, fbt) => ({ c, n: `测试${c}`, m: 0, p: 12540, zdp: 9.99, hs: 7.2, lbc, fbt, lbt: 145900, fund: 123000000, zbc: 0, hybk });
const poolPayload = { rc: 0, data: { tc: 3, pool: [stock('000001', 1, '测试行业甲', 93500), stock('000002', 3, '测试行业乙', 100000), stock('000003', 2, '测试行业甲', 94500)] } };
const json = body => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

test('news preserves Shanghai timestamps, deduplicates and removes unsafe links and markup', () => {
  const news = normalizeNews(newsPayload, now);
  assert.equal(news.items.length, 2);
  assert.equal(news.items[0].id, '2');
  assert.equal(news.items[1].title, '测试政策快讯');
  assert.equal(news.items[1].publishedAt, '2026-10-18T01:10:00.000Z');
  assert.equal(news.items[1].url, 'https://finance.eastmoney.com/a/1.html');
  assert.throws(() => normalizeNews({ data: {} }, now));
});
test('pool calculations use correct units, leading-zero times and consistent scope', () => {
  const pool = normalizePool(poolPayload, '2026-10-16', now);
  assert.deepEqual(pool.summary, { total: 3, firstBoard: 1, consecutive: 2, highest: 3 });
  assert.deepEqual(pool.sectors[0], { name: '测试行业甲', count: 2 });
  assert.equal(pool.stocks[0].code, '000002');
  assert.equal(pool.stocks[0].price, 12.54);
  assert.equal(pool.stocks.find(s => s.code === '000001').firstSeal, '09:35:00');
  assert.equal(pool.stocks[0].sealAmount, 123000000);
  assert.equal(pool.tradeDate, '2026-10-16');
  assert.equal(pool.ladder.reduce((sum, row) => sum + row.count, 0), pool.summary.total);
});
test('missing, malformed and truncated pools cannot masquerade as zero or complete data', () => {
  assert.equal(normalizePool({ data: null }, '2026-10-16', now), null);
  assert.equal(normalizePool({ data: { pool: [] } }, '2026-10-16', now), null);
  assert.throws(() => normalizePool({ rc: 1, data: null }, '2026-10-16', now));
  assert.throws(() => normalizePool({ data: { ...poolPayload.data, tc: 7 } }, '2026-10-16', now));
  assert.throws(() => normalizePool({ data: { pool: [{ ...stock('000001', 1, '甲', 93000), lbc: null }] } }, '2026-10-16', now));
});
test('invalid calendar dates, future and over-30-day dates are rejected before upstream access', async () => {
  assert.throws(() => validateDate('2026-02-31', now));
  assert.throws(() => validateDate('2026-10-19', now));
  assert.throws(() => validateDate('2026-01-01', now));
  assert.equal(validateDate('2026-10-16', now), '2026-10-16');
  assert.equal(recentWeekdays(now)[0], '2026-10-16');
  assert.equal((await marketAPI(new Request('https://example.com/api/market?date=bad'))).status, 400);
  assert.equal((await marketAPI(new Request('https://example.com/api/market', { method: 'POST' }))).status, 405);
});
test('latest mode rolls over empty holiday dates and explicitly retains the returned data date', async () => {
  const calls = [];
  const result = await loadMarket({ now, fetcher: async url => {
    if (url.hostname.startsWith('np-weblist')) return json(newsPayload);
    calls.push(url.searchParams.get('date'));
    return json(calls.length === 1 ? { data: null } : poolPayload);
  } });
  assert.deepEqual(calls, ['20261016', '20261015']);
  assert.equal(result.limitUp.tradeDate, '2026-10-15');
});
test('failure retains original success time without attaching a different date to cached stocks', async () => {
  const previous = { news: normalizeNews(newsPayload, now), limitUp: normalizePool(poolPayload, '2026-10-16', now) };
  const fetcher = async () => { throw new Error('offline'); };
  const result = await loadMarket({ now: new Date(+now + 3600000), previous, fetcher });
  assert.equal(result.news.status, 'stale');
  assert.equal(result.news.fetchedAt, now.toISOString());
  assert.equal(result.limitUp.tradeDate, '2026-10-16');
  const otherDay = await loadMarket({ now, previous, date: '2026-10-15', fetcher });
  assert.equal(otherDay.limitUp.status, 'unavailable');
  assert.deepEqual(otherDay.limitUp.stocks, []);
  assert.equal(otherDay.limitUp.summary, null);
});
test('independent feeds survive a partial upstream outage', async () => {
  const result = await loadMarket({ now, fetcher: async url => {
    if (url.hostname.startsWith('np-weblist')) return json(newsPayload);
    return new Response('rate limit', { status: 429 });
  } });
  assert.equal(result.news.status, 'ok');
  assert.equal(result.limitUp.status, 'unavailable');
});
test('parallel visitors share a refresh, TTL expiry refreshes, date queries remain isolated', async () => {
  let calls = 0;
  const service = createMarketService(async ({ date }) => { calls++; await new Promise(resolve => setTimeout(resolve, 10)); return { date, news: { status: 'ok' }, limitUp: { status: 'ok' } }; });
  await Promise.all([service('', now), service('', now), service('', now)]);
  assert.equal(calls, 1);
  await service('', new Date(+now + 59000)); assert.equal(calls, 1);
  await service('', new Date(+now + 61000)); assert.equal(calls, 2);
  assert.equal((await service('2026-10-16', now)).date, '2026-10-16');
  assert.equal(calls, 3);
});
