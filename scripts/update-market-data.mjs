import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadMarket } from '../server/market-data.mjs';

const validTime = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && validTime(`${value}T00:00:00Z`) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
const validShape = value => value?.version === 1
  && Array.isArray(value.news?.items)
  && Array.isArray(value.limitUp?.stocks)
  && Array.isArray(value.limitUp?.sectors)
  && Array.isArray(value.limitUp?.ladder);

export function snapshotHealth(data) {
  const news = validTime(data.news.fetchedAt)
    && ['ok', 'stale'].includes(data.news.status) && data.news.items.length > 0;
  const pool = validTime(data.limitUp.fetchedAt) && validDate(data.limitUp.tradeDate) && (
    data.limitUp.status === 'empty' && data.limitUp.stocks.length === 0
    || ['ok', 'stale'].includes(data.limitUp.status) && data.limitUp.stocks.length > 0
  );
  return {
    usable: news && pool,
    missing: [!news && 'news', !pool && 'limit-up'].filter(Boolean),
    fresh: news && data.news.status === 'ok'
      && pool && ['ok', 'empty'].includes(data.limitUp.status),
  };
}

// The updater publishes stale snapshots too, so visitors retain useful data.
// Deploy uses --require-data to reject an initial site with either feed missing.
export async function updateMarketSnapshot({ destination = 'public/data/market.json', requireData = false, loader = loadMarket, logger = console } = {}) {
  destination = path.resolve(destination);
  let previous = null;
  try {
    const value = JSON.parse(await readFile(destination, 'utf8'));
    if (!validShape(value)) throw new Error('invalid snapshot structure');
    previous = value;
  } catch (error) {
    if (error.code !== 'ENOENT') logger.warn(`::warning::Previous snapshot ignored: ${error.message}`);
  }
  const data = { ...await loader({ previous }), mode: 'snapshot', refreshSeconds: 300 };
  if (!validShape(data)) throw new Error('Collected market snapshot has an invalid structure; previous file left unchanged.');
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(`${destination}.tmp`, JSON.stringify(data, null, 2) + '\n');
  await rename(`${destination}.tmp`, destination);
  const health = snapshotHealth(data);
  logger.log(`News: ${data.news.status}, ${data.news.items.length} items, fetched ${data.news.fetchedAt || 'never'}; limit-up: ${data.limitUp.status}, ${data.limitUp.stocks.length} stocks, fetched ${data.limitUp.fetchedAt || 'never'}; trade date: ${data.limitUp.tradeDate || 'unavailable'}. Scheduled refresh: 300 seconds.`);
  if (!health.fresh) logger.warn('::warning::One or more feeds did not refresh. Retained data keeps its original successful timestamp; no substitute market numbers were generated.');
  if (requireData && !health.usable) throw new Error(`Initial market data is unavailable for ${health.missing.join(' and ')}. Deployment stopped; no usable previous snapshot exists for those feeds.`);
  if (requireData && !health.fresh) logger.warn('::warning::Deployment is using a retained market snapshot. Visitors will see its original date and stale status.');
  return data;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    const destinations = args.filter(arg => !arg.startsWith('--'));
    if (args.includes('--help')) {
      console.log('Usage: node scripts/update-market-data.mjs [destination] [--require-data]\nDefault: publish the latest result, retaining previous successful data on failure.\n--require-data: fail unless both feeds have usable data (empty pools require an explicit valid trade date); retained snapshots are allowed with warnings.');
    } else {
      if (destinations.length > 1 || args.some(arg => arg.startsWith('--') && arg !== '--require-data')) throw new Error('Unknown argument. Use --help for usage.');
      await updateMarketSnapshot({ destination: destinations[0], requireData: args.includes('--require-data') });
    }
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  }
}
