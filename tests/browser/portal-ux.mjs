// Browser task checks, using explicit synthetic data only in intercepted requests.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { normalizeNews, normalizePool, unavailable } from '../../server/market-data.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const axeScript = process.env.AXE_SCRIPT || new URL(import.meta.resolve('axe-core/axe.min.js')).pathname;
const base = process.env.UX_BASE_URL || 'http://localhost:3000';
const output = process.env.UX_OUTPUT_DIR || 'outputs/ux-v2';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const report = { tasks: [], viewports: [], accessibility: [], errors };
const check = (name) => { report.tasks.push(name); console.log('PASS', name); };
const waitFor = async fn => { await page.waitForFunction(fn); };
const now = new Date();
const tradeDate = new Date(+now - 2 * 86400000).toISOString().slice(0, 10);
const previousDate = new Date(+now - 3 * 86400000).toISOString().slice(0, 10);
const items = Array.from({ length: 12 }, (_, i) => ({ code: String(990000 + i), title: `交互测试：${i % 2 ? 'AI芯片产业' : '央行政策'}快讯 ${i + 1}`, summary: '合成数据，仅用于验证交互，不是真实市场消息。', showTime: new Date(+now - i * 60000).toISOString(), titleColor: i % 3 === 0 ? 3 : 0 }));
const fixture = { version: 1, mode: 'live', checkedAt: now.toISOString(), refreshSeconds: 60,
  news: normalizeNews({ data: { fastNewsList: items } }, now),
  limitUp: normalizePool({ rc: 0, data: { tc: 12, pool: Array.from({ length: 12 }, (_, i) => ({ c: String(i + 1).padStart(6, '0'), n: `演示股票${String(i + 1).padStart(2, '0')}`, m: 0, p: 10000, zdp: 10, lbc: i % 3 + 1, fbt: 93000 + i * 100, lbt: 143000, fund: 20000000 * (i + 1), hybk: i % 2 ? '演示行业甲' : '演示行业乙', zbc: 0, hs: 7.5 })) } }, tradeDate, now),
};
let response = fixture;
let mode = 'ok';
await page.route('**/api/market*', route => mode === 'offline' ? route.abort() : route.fulfill({ json: response }));
await page.goto(base + '/', { waitUntil: 'networkidle' });
assert.equal(await page.title(), '路见资本｜看见产业，理解资本');
assert.equal(await page.locator('.lj-footer a[href$="/mirror/"]').count(), 1);
assert.equal(await page.locator('nav a[href$="/mirror/"]').count(), 0);
await page.getByRole('navigation', { name: '手机快捷导航' }).getByRole('link', { name: '快讯', exact: true }).click();
await waitFor(() => document.querySelector('.lj-mobile-nav a[href="/#news"]')?.getAttribute('aria-current') === 'location');
assert.ok((await page.locator('#news').boundingBox()).y >= 76, 'anchored content must clear the sticky header');
check('Persistent navigation keeps position and anchors clear of the header');

await page.getByRole('searchbox', { name: '搜索新闻' }).fill('芯片');
assert.equal(await page.locator('.lj-news-item').count(), 6);
await page.getByRole('checkbox', { name: '只看要闻' }).check();
assert.equal(await page.locator('.lj-news-item').count(), 2);
await page.getByRole('searchbox', { name: '搜索新闻' }).fill('没有这个关键词');
await page.getByRole('button', { name: '清除新闻筛选' }).click();
assert.equal(await page.locator('.lj-news-item').count(), 7);
check('News keyword, importance and category filters recover from zero results');
const firstHeadline = await page.locator('.lj-news-item h3').first().innerText();
response = structuredClone(fixture);
response.news.items.unshift({ ...fixture.news.items[0], id: 'new-ux-test', title: '交互测试：后到的新快讯' });
await page.getByRole('button', { name: '刷新市场数据' }).click();
await page.getByRole('button', { name: /1 条新快讯/ }).waitFor();
assert.equal(await page.locator('.lj-news-item h3').first().innerText(), firstHeadline);
await page.getByRole('button', { name: /1 条新快讯/ }).click();
assert.ok((await page.locator('.lj-news-item h3').first().innerText()).includes('后到的新快讯'));
check('Refresh buffers arrivals without moving the headline being read');

await page.getByRole('navigation', { name: '手机快捷导航' }).getByRole('link', { name: '复盘', exact: true }).click();
await waitFor(() => document.querySelector('.lj-mobile-nav a[href="/#limit-up"]')?.getAttribute('aria-current') === 'location');
assert.equal(await page.locator('.lj-stock-card:visible').count(), 8);
assert.equal(await page.locator('.lj-desktop-stocks:visible').count(), 0);
await page.locator('.lj-stock-card').first().locator('summary').click();
assert.ok(await page.locator('.lj-stock-card').first().getByText('换手率', { exact: true }).isVisible());
await page.locator('.lj-ladder button').filter({ hasText: '3板' }).click();
assert.equal(await page.locator('.lj-stock-card:visible').count(), 4);
await page.getByRole('combobox', { name: '筛选行业' }).selectOption('演示行业甲');
assert.equal(await page.locator('.lj-stock-card:visible').count(), 2);
assert.ok(await page.getByRole('button', { name: '移除行业筛选' }).isVisible());
await page.getByRole('searchbox', { name: '搜索涨停股票' }).fill('000006');
assert.equal(await page.locator('.lj-stock-card:visible').count(), 1);
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: '导出筛选结果 ↓' }).click();
const download = await downloadPromise;
assert.ok(download.suggestedFilename().includes(tradeDate));
const stream = await download.createReadStream(); let csv = ''; for await (const chunk of stream) csv += chunk.toString('utf8');
assert.ok(csv.includes('000006'));
assert.equal(csv.trim().split('\n').length, 2, 'export follows all active filters');
await page.getByRole('button', { name: '重置筛选' }).click();
assert.equal(await page.locator('.lj-stock-card:visible').count(), 8);
await page.getByRole('button', { name: '再看 4 只 ↓' }).click();
assert.equal(await page.locator('.lj-stock-card:visible').count(), 12);
check('Mobile cards, expandable facts, exact board filters, removable chips and matching CSV');

mode = 'offline';
await page.getByLabel('涨停复盘日期', { exact: true }).fill(previousDate);
await page.getByRole('heading', { name: '涨停数据暂时不可用' }).waitFor();
assert.equal(await page.locator('.lj-stock-card').count(), 0);
assert.ok(await page.locator('.lj-news-item').count() > 0, 'date failure must not wipe the news being read');
mode = 'ok';
await page.getByRole('button', { name: '返回最近可用日' }).click();
await page.locator('.lj-stock-card').first().waitFor();
response = { ...fixture, news: unavailable('news'), limitUp: unavailable('pool') };
await page.getByRole('button', { name: '刷新涨停复盘' }).click();
await page.getByText(/当前保留/).waitFor();
assert.equal(await page.locator('.lj-stock-card:visible').count(), 8);
assert.ok((await page.locator('.lj-review-dateline').innerText()).includes(tradeDate));
check('Date failures isolate stocks from news; server cache loss retains dated browser data');
response = fixture;
await page.getByRole('button', { name: '刷新涨停复盘' }).click();
await waitFor(() => !document.querySelector('.lj-refresh')?.disabled);

for (const width of [320, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.evaluate(() => scrollTo(0, 0));
  const metrics = await page.evaluate(() => ({ width: innerWidth, pageWidth: document.documentElement.scrollWidth, newsY: Math.round(document.querySelector('#news').getBoundingClientRect().top + scrollY) }));
  assert.equal(metrics.pageWidth, width, `page overflow at ${width}`);
  report.viewports.push(metrics);
  if (width === 390 || width === 1440) {
    await page.addScriptTag({ path: axeScript });
    const audit = await page.evaluate(async () => await axe.run(document.querySelector('.lj-site'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
    const violations = audit.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }));
    report.accessibility.push({ width, page: 'home-with-test-data', violations });
  }
}
check('320 / 390 / 768 / 1024 / 1440 responsive layouts have no page overflow');

await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole('navigation', { name: '手机快捷导航' }).getByRole('link', { name: '研究', exact: true }).click();
await page.locator('.lj-library-grid a').first().waitFor();
const initialResearchCount = await page.locator('.lj-library-grid a').count();
await page.getByRole('button', { name: '产业主线', exact: true }).click();
await page.getByRole('searchbox', { name: '搜索研究' }).fill('具身');
assert.equal(await page.locator('.lj-library-grid a').count(), 1);
assert.ok(page.url().includes('category='));
await page.locator('.lj-library-grid a').click();
await page.locator('.lj-prose').waitFor();
await page.locator('.lj-mobile-toc summary').click();
const heading = await page.locator('.lj-mobile-toc nav a').last().getAttribute('href');
await page.locator('.lj-mobile-toc nav a').last().click();
await waitFor(() => !document.querySelector('.lj-mobile-toc')?.open);
assert.ok(await page.locator(heading).isVisible());
await page.waitForFunction(() => Number(document.querySelector('[aria-label="文章阅读进度"]').getAttribute('aria-valuenow')) > 0);
await page.getByRole('link', { name: '← 返回研究列表', exact: true }).first().click();
await page.getByRole('searchbox', { name: '搜索研究' }).waitFor();
assert.equal(await page.getByRole('searchbox', { name: '搜索研究' }).inputValue(), '具身');
assert.equal(await page.getByRole('button', { name: '产业主线', exact: true }).getAttribute('aria-pressed'), 'true');
assert.equal(await page.locator('.lj-library-grid a').count(), 1);
check('Research filters survive article round-trips; mobile contents and reading progress work');
await page.getByRole('searchbox', { name: '搜索研究' }).fill('不存在的研究');
await page.getByRole('button', { name: '查看全部研究' }).click();
assert.equal(await page.locator('.lj-library-grid a').count(), initialResearchCount);
check('Research empty state restores all published articles');

await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
assert.equal(await page.evaluate(() => document.activeElement?.textContent), '跳到正文');
await page.keyboard.press('Enter');
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
await page.getByRole('button', { name: '复制公众号名称' }).click();
assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '路见资本');
check('Skip link and copy-account action give useful keyboard and action feedback');

// Clearly label visual prototypes that use intercepted financial data.
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => {
  const notice = document.createElement('div'); notice.textContent = '交互原型 · 以下为演示数据，非真实行情';
  notice.setAttribute('data-prototype-label', 'true');
  Object.assign(notice.style, { position: 'fixed', top: '76px', left: '0', right: '0', padding: '8px', background: '#f6db9d', color: '#263c28', zIndex: '100', fontSize: '12px', textAlign: 'center' }); document.body.append(notice);
});
await page.getByRole('navigation', { name: '手机快捷导航' }).getByRole('link', { name: '复盘', exact: true }).click();
await page.locator('.lj-stock-card').first().scrollIntoViewIfNeeded();
await page.evaluate(() => { const rect = document.querySelector('.lj-stock-card').getBoundingClientRect(); scrollTo(0, rect.top + scrollY - 125); });
await page.waitForFunction(() => { const top = document.querySelector('.lj-stock-card').getBoundingClientRect().top; return top >= 110 && top <= 140; });
await page.screenshot({ path: `${output}/prototype-mobile-stocks.png` });
await page.evaluate(() => document.querySelector('[data-prototype-label]')?.remove());
assert.deepEqual(errors, []);
await writeFile(`${output}/task-checks.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
assert.ok(report.accessibility.every(audit => audit.violations.length === 0), 'Accessibility audit must have zero detected violations');
} finally { await browser.close(); }
