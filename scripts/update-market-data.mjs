import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadMarket } from '../server/market-data.mjs';

const destination = path.resolve(process.argv[2] || 'public/data/market.json');
let previous = null;
try { previous = JSON.parse(await readFile(destination, 'utf8')); } catch {}
const data = { ...await loadMarket({ previous }), mode: 'snapshot', refreshSeconds: 900 };
await mkdir(path.dirname(destination), { recursive: true });
await writeFile(`${destination}.tmp`, JSON.stringify(data, null, 2) + '\n');
await rename(`${destination}.tmp`, destination);
console.log(`News: ${data.news.status}; limit-up: ${data.limitUp.status}; trade date: ${data.limitUp.tradeDate || 'unavailable'}`);
if (data.news.status !== 'ok' || !['ok', 'empty'].includes(data.limitUp.status)) console.warn('Source unavailable; retained successful timestamps. No substitute market numbers generated.');
