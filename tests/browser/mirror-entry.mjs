// Focused navigation regression: works against a local static export or production.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.UX_BASE_URL || 'http://localhost:3000';
const output = process.env.UX_OUTPUT_DIR || 'outputs/mirror-entry';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const report = { viewports: [], navigation: [], errors: [] };
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  for (const width of [320, 390, 768, 781, 800, 950, 1280, 1440]) {
    const height = width < 781 ? 844 : 900;
    await page.setViewportSize({ width, height });
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    const hero = page.locator('.lj-mirror-entry');
    await hero.waitFor();
    assert.equal(await hero.getAttribute('href'), '/mirror/');
    assert.match(await hero.innerText(), /股市照妖镜/);
    const rect = await hero.boundingBox();
    assert.ok(rect.x >= 0 && rect.x + rect.width <= width, `Entry fits at ${width}px`);
    assert.ok(rect.y >= 0 && rect.y + rect.height < height - 70, `Entry is above the fold at ${width}px`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `No horizontal overflow at ${width}px`);
    const nav = page.locator(width < 781 ? '.lj-mobile-nav' : '.lj-desktop-nav');
    assert.ok(await nav.locator('a[href="/mirror/"]').isVisible());
    if (width < 781) assert.equal(await nav.locator('a').count(), 5);
    const boxes = await page.locator('.lj-nav-inner > *').evaluateAll(elements => elements.filter(el => getComputedStyle(el).display !== 'none' && getComputedStyle(el).position !== 'fixed').map(el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right }; }));
    for (let i = 1; i < boxes.length; i++) assert.ok(boxes[i].left >= boxes[i - 1].right - 1, `Header controls do not overlap at ${width}px`);
    report.viewports.push({ width, firstScreenEntry: true, noOverflow: true, navigationVisible: true });
    if ([390, 1440].includes(width)) await page.screenshot({ path: `${output}/home-${width}.png` });
  }
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    for (const selector of ['.lj-mirror-entry', width < 781 ? '.lj-mobile-nav a[href="/mirror/"]' : '.lj-desktop-nav a[href="/mirror/"]']) {
      await page.locator(selector).click();
      await page.waitForURL('**/mirror/');
      await page.waitForFunction(() => document.title.includes('股市照妖镜'));
      assert.match(await page.title(), /股市照妖镜/);
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await page.locator('.lj-mirror-entry').waitFor();
      report.navigation.push({ width, selector, reachedMirror: true, backRestoredHome: true });
    }
  }
  assert.deepEqual(report.errors, []);
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
