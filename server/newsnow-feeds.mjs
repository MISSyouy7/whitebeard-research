// Anonymous server-side fallbacks. Visitors never need a NewsNow account or key.
// NewsNow's updatedTime is cache metadata, not an article publication timestamp.
const SOURCES = {
  'cls-telegraph': {
    name: 'NewsNow · 财联社电报',
    url: 'https://www.cls.cn/telegraph',
    hosts: ['cls.cn'],
  },
  'wallstreetcn-quick': {
    name: 'NewsNow · 华尔街见闻快讯',
    url: 'https://wallstreetcn.com/live/global',
    hosts: ['wallstreetcn.com', 'wallstcn.com'],
  },
};
const MAX_AGE = 24 * 60 * 60 * 1000;
const clean = value => typeof value === 'string'
  ? value.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ').trim()
  : '';

function timestamp(value) {
  if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
    const result = Number(value);
    return Number.isSafeInteger(result) && result > 0 && Number.isFinite(+new Date(result)) ? result : NaN;
  }
  // Only accept explicitly zoned ISO dates; local dates depend on the host TZ.
  if (typeof value !== 'string') return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return NaN;
  const [, year, month, day, hour, minute, second] = match.map(Number);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) return NaN;
  return Date.parse(value);
}

function safeUrl(value, hosts) {
  if (typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return null;
    if (!hosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) return null;
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

export function normalizeNewsNow(payload, sourceId, now = new Date()) {
  const source = Object.hasOwn(SOURCES, sourceId) ? SOURCES[sourceId] : null;
  if (!source || !Number.isFinite(+now) || !['success', 'cache'].includes(payload?.status) || payload?.id !== sourceId || !Array.isArray(payload?.items)) {
    throw new Error('备用快讯数据结构异常');
  }
  const candidates = payload.items.flatMap(row => {
    if (!row || typeof row !== 'object') return [];
    const id = typeof row.id === 'string' ? row.id.trim() : Number.isSafeInteger(row.id) && row.id >= 0 ? String(row.id) : '';
    const title = clean(row.title).slice(0, 300);
    const published = timestamp(sourceId === 'cls-telegraph' ? row.pubDate : row.extra?.date);
    const url = safeUrl(row.url, source.hosts);
    if (!id || id.length > 200 || !title || !url || !Number.isFinite(published) || published > +now) return [];
    return [{ id: `newsnow:${sourceId}:${id}`, title, summary: '', publishedAt: new Date(published).toISOString(), url, important: false, source: source.name }];
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const seenIds = new Set();
  const seenUrls = new Set();
  const items = candidates.filter(item => {
    if (seenIds.has(item.id) || seenUrls.has(item.url)) return false;
    seenIds.add(item.id);
    seenUrls.add(item.url);
    return true;
  }).slice(0, 40);
  if (!items.length) throw new Error('备用快讯没有有效条目');
  // Reject old upstream caches so the caller can retain its last successful feed
  // rather than overwriting it and presenting an old response as a live update.
  if (+now - Date.parse(items[0].publishedAt) > MAX_AGE) throw new Error('备用快讯已超过24小时未更新');
  return { status: 'ok', source: { name: source.name, url: source.url }, fetchedAt: now.toISOString(), latestAt: items[0].publishedAt, items };
}

async function fetchWithin(fetcher, sourceId, now, timeout) {
  const controller = new AbortController();
  let timer;
  const expired = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('备用快讯查询超时'));
    }, timeout);
  });
  const request = (async () => {
    const url = new URL('https://newsnow.busiyi.world/api/s');
    url.searchParams.set('id', sourceId);
    const response = await fetcher(url, {
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`备用快讯 HTTP ${response.status}`);
    return normalizeNewsNow(await response.json(), sourceId, now);
  })();
  try {
    return await Promise.race([request, expired]);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchNewsNow(fetcher = fetch, now = new Date()) {
  const deadline = performance.now() + 8000;
  let failure = new Error('备用快讯暂不可用');
  for (const sourceId of Object.keys(SOURCES)) {
    const remaining = Math.floor(deadline - performance.now());
    if (remaining <= 0) break;
    try {
      return await fetchWithin(fetcher, sourceId, now, Math.min(4000, remaining));
    } catch (error) {
      failure = error;
    }
  }
  throw failure;
}
