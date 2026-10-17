import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchNewsNow, normalizeNewsNow } from '../server/newsnow-feeds.mjs';

const now = new Date('2026-10-18T02:00:00Z');
const cls = 'cls-telegraph';
const wallstreet = 'wallstreetcn-quick';
// Synthetic contract fixtures stay in tests; these are not public market data.
const row = (id = 1, overrides = {}) => ({ id, title: `测试快讯${id}`, url: `https://www.cls.cn/detail/${id}`, pubDate: +now - 60_000, ...overrides });
const payload = (items = [row()], overrides = {}) => ({ status: 'success', id: cls, updatedTime: +now, items, ...overrides });
const wallstreetPayload = overrides => payload([
  { id: 2, title: '测试华尔街快讯', url: 'https://wallstreetcn.com/livenews/2', extra: { date: +now - 30_000 } },
], { id: wallstreet, ...overrides });
const json = value => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });

test('CLS contract preserves publication time, cleans titles, sorts and deduplicates', () => {
  const feed = normalizeNewsNow(payload([
    row(1, { title: '<b>测试&nbsp;政策</b> &amp; 产业', pubDate: +now - 120_000 }),
    row(2, { title: '<script>not a headline</script>最新快讯' }),
    row(2, { title: '重复ID', pubDate: +now - 90_000 }),
    row(3, { url: 'https://www.cls.cn/detail/2#same-article' }),
  ]), cls, now);
  assert.equal(feed.status, 'ok');
  assert.equal(feed.fetchedAt, now.toISOString());
  assert.equal(feed.latestAt, '2026-10-18T01:59:00.000Z');
  assert.equal(feed.items.length, 2);
  assert.equal(feed.items[0].id, 'newsnow:cls-telegraph:2');
  assert.equal(feed.items[0].title, '最新快讯');
  assert.equal(feed.items[1].title, '测试 政策 & 产业');
  assert.equal(feed.items[0].important, false);
  assert.equal(feed.items[0].summary, '');
});

test('WallstreetCN contract takes extra.date and retains fresh cache article timestamps', () => {
  const feed = normalizeNewsNow(wallstreetPayload({ status: 'cache', updatedTime: +now + 999_999 }), wallstreet, now);
  assert.equal(feed.latestAt, '2026-10-18T01:59:30.000Z');
  assert.equal(feed.items[0].publishedAt, feed.latestAt);
  assert.equal(feed.items[0].url, 'https://wallstreetcn.com/livenews/2');
  assert.match(feed.source.name, /华尔街/);
  assert.equal(feed.items[0].id, 'newsnow:wallstreetcn-quick:2');
});

test('rejects invalid feed contracts and empty feeds', () => {
  for (const value of [null, {}, payload([], {}), payload(undefined, { status: 'error' }), payload(undefined, { id: wallstreet }), payload(undefined, { items: {} })]) {
    assert.throws(() => normalizeNewsNow(value, cls, now));
  }
  assert.throws(() => normalizeNewsNow(payload(), '__proto__', now));
  assert.throws(() => normalizeNewsNow(payload(), cls, new Date('invalid')));
});

test('missing, impossible and future publication dates never fall back to updatedTime', () => {
  const invalidDates = [undefined, null, '', true, NaN, Infinity, 'not a date', '2026-02-30T01:00:00Z', '2026-10-18T01:00:00', '2026-10-18T24:00:00Z', +now + 1];
  for (const date of invalidDates) {
    assert.throws(() => normalizeNewsNow(payload([row(1, { pubDate: date })]), cls, now), `must reject ${String(date)}`);
  }
  const missing = wallstreetPayload();
  missing.items[0].pubDate = +now - 60_000;
  delete missing.items[0].extra;
  assert.throws(() => normalizeNewsNow(missing, wallstreet, now));
  const dated = normalizeNewsNow(payload([row(1, { pubDate: '2026-10-18T09:30:00+08:00' })]), cls, now);
  assert.equal(dated.latestAt, '2026-10-18T01:30:00.000Z');
  assert.equal(normalizeNewsNow(payload([row(1, { pubDate: String(+now - 60_000) })]), cls, now).latestAt, '2026-10-18T01:59:00.000Z');
});

test('unsafe links are removed and source-specific HTTPS hosts are enforced', () => {
  const unsafe = [
    'javascript:alert(1)', 'data:text/html,hello', 'http://www.cls.cn/detail/1',
    'https://cls.cn.evil.example/1', 'https://evilcls.cn/1', 'https://cls.cn@evil.example/1',
    'https://user:secret@www.cls.cn/detail/1', 'https://www.cls.cn:8443/detail/1',
    'https://wallstreetcn.com/livenews/1', '//www.cls.cn/detail/1',
    'https://www.cls.cn\\@evil.example/1', 'https://www.cls.cn/\n1',
  ];
  for (const url of unsafe) assert.throws(() => normalizeNewsNow(payload([row(1, { url })]), cls, now), url);
  const feed = normalizeNewsNow(payload([row(1, { url: 'https://CLS.CN:443/detail/1' }), ...unsafe.map((url, i) => row(i + 2, { url }))]), cls, now);
  assert.equal(feed.items.length, 1);
  assert.equal(feed.items[0].url, 'https://cls.cn/detail/1');
  const wall = wallstreetPayload();
  wall.items[0].url = 'https://wallstcn.com/livenews/2';
  assert.equal(normalizeNewsNow(wall, wallstreet, now).items.length, 1);
});

test('old caches are rejected instead of being represented as fresh news', () => {
  const cached = payload([row(1, { pubDate: +now - 86_400_001 })], { status: 'cache', updatedTime: +now });
  assert.throws(() => normalizeNewsNow(cached, cls, now), /24小时/);
  assert.equal(normalizeNewsNow(payload([row(1, { pubDate: +now - 86_400_000 })]), cls, now).status, 'ok');
});

test('malformed individual rows are skipped, title length and list size are bounded', () => {
  const feed = normalizeNewsNow(payload([null, {}, row(0, { title: '' }), ...Array.from({ length: 50 }, (_, i) => row(i + 1, { title: '测试'.repeat(200), pubDate: +now - (i + 1) * 1000 }))]), cls, now);
  assert.equal(feed.items.length, 40);
  assert.equal(feed.items[0].title.length, 300);
  assert.equal(feed.items[0].id, 'newsnow:cls-telegraph:1');
  assert.equal(feed.items[39].id, 'newsnow:cls-telegraph:40');
});

test('anonymous fetch uses CLS first without requesting a forced refresh', async () => {
  const calls = [];
  const result = await fetchNewsNow(async (url, options) => {
    calls.push(url.href);
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.headers.Authorization, undefined);
    assert.ok(options.signal instanceof AbortSignal);
    return json(payload());
  }, now);
  assert.equal(result.status, 'ok');
  assert.deepEqual(calls, ['https://newsnow.busiyi.world/api/s?id=cls-telegraph']);
});

test('HTTP errors, malformed responses and old caches fail over to WallstreetCN', async () => {
  for (const first of [() => new Response('Unavailable', { status: 503 }), () => json({ status: 'error' }), () => json(payload([row(1, { pubDate: +now - 86_400_001 })]))]) {
    const calls = [];
    const feed = await fetchNewsNow(async url => {
      calls.push(url.searchParams.get('id'));
      return calls.length === 1 ? first() : json(wallstreetPayload());
    }, now);
    assert.deepEqual(calls, [cls, wallstreet]);
    assert.match(feed.source.name, /华尔街/);
  }
});

test('both failed sources reject, allowing caller to retain its own successful snapshot', async () => {
  const calls = [];
  await assert.rejects(fetchNewsNow(async url => { calls.push(url.searchParams.get('id')); throw new Error('offline'); }, now), /offline/);
  assert.deepEqual(calls, [cls, wallstreet]);
});

test('timeouts abort stalled requests, fail over, and include stalled JSON parsing', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const signals = [];
  const calls = [];
  const pending = fetchNewsNow(async (url, { signal }) => {
    calls.push(url.searchParams.get('id'));
    signals.push(signal);
    if (calls.length === 1) return new Promise(() => {});
    return { ok: true, json: () => new Promise(() => {}) };
  }, now);
  t.mock.timers.tick(4000);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(signals[0].aborted, true);
  assert.deepEqual(calls, [cls, wallstreet]);
  const rejected = assert.rejects(pending, /超时/);
  t.mock.timers.tick(4000);
  await rejected;
  assert.equal(signals[1].aborted, true);
});
