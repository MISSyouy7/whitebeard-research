import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { collectPeriodicals, validSnapshot } from '../server/periodicals.mjs';

export async function updatePeriodicals({ destination = 'public/data/periodicals.json', restoreURL, requireData = false, collector = collectPeriodicals, fetcher = fetch, logger = console } = {}) {
  let previous;
  try {
    previous = JSON.parse(await readFile(destination, 'utf8'));
    if (!validSnapshot(previous)) previous = undefined;
  } catch { /* First collection has no snapshot yet. */ }
  if (restoreURL) {
    try {
      const response = await fetcher(restoreURL, { cache: 'no-store', signal: AbortSignal.timeout(12000), redirect: 'error' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const restored = await response.json();
      if (!validSnapshot(restored)) throw new Error('Invalid public snapshot');
      if (!previous) previous = restored;
      else previous.publications = previous.publications.map(local => {
        const remote = restored.publications.find(item => item.id === local.id);
        return remote?.fetchedAt && (!local.fetchedAt || remote.fetchedAt > local.fetchedAt) ? remote : local;
      });
    } catch (error) { logger.warn(`::notice::Public periodicals snapshot not restored: ${error.message}; using bundled snapshot when available.`); }
  }
  const data = await collector({ previous, logger });
  if (!validSnapshot(data)) throw new Error('Invalid periodicals collection');
  if (requireData && data.publications.some(item => !item.items.length)) throw new Error('A periodical has no usable issues; publication stopped');
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(`${destination}.tmp`, JSON.stringify(data, null, 2) + '\n');
  await rename(`${destination}.tmp`, destination);
  for (const source of data.publications) logger.log(`${source.name}: ${source.status}, ${source.items.length} issues, last collected ${source.fetchedAt || 'never'}`);
  return data;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  try {
    if (args.some(arg => !['--restore-public', '--require-data'].includes(arg))) throw new Error('Usage: node scripts/update-periodicals.mjs [--restore-public] [--require-data]');
    await updatePeriodicals({ requireData: args.includes('--require-data'), restoreURL: args.includes('--restore-public') ? 'https://baihuzigl.com/data/periodicals.json' : undefined });
  } catch (error) { console.error(`::error::${error.message}`); process.exitCode = 1; }
}
