// Market workspace tasks. Financial fixtures never enter public site data.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import {
  normalizeNews,
  normalizePool,
  unavailable,
} from "../../server/market-data.mjs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
const axeScript =
  process.env.AXE_SCRIPT ||
  new URL(import.meta.resolve("axe-core/axe.min.js")).pathname;
const base = process.env.UX_BASE_URL || "http://localhost:3000";
const output = process.env.UX_OUTPUT_DIR || "outputs/glass-ui";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const report = { tasks: [], accessibility: [], errors: [] };
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  const now = new Date();
  const date = new Date(+now - 2 * 86400000).toISOString().slice(0, 10);
  const counts = [17, 9, 5, 3, 2];
  const pool = counts.flatMap((count, index) =>
    Array.from({ length: count }, (_, i) => ({
      c: String(990000 + index * 100 + i),
      n: `演示企业${index + 1}-${i + 1}`,
      m: 0,
      p: 23600,
      zdp: 10,
      lbc: index + 1,
      fbt: 93100 + i * 100,
      lbt: 140100,
      fund: 30000000,
      hybk: ["演示行业甲", "演示行业乙", "演示行业丙"][i % 3],
      zbc: 0,
      hs: 6.5,
    })),
  );
  const fixture = {
    version: 1,
    mode: "live",
    checkedAt: now.toISOString(),
    refreshSeconds: 60,
    news: normalizeNews(
      {
        data: {
          fastNewsList: [
            {
              code: "demo-1",
              title: "交互原型：产业观察与研究方法",
              summary: "此条为交互测试数据，并非真实市场新闻。",
              showTime: now.toISOString(),
              titleColor: 3,
            },
          ],
        },
      },
      now,
    ),
    limitUp: normalizePool(
      { rc: 0, data: { tc: pool.length, pool } },
      date,
      now,
    ),
  };
  let response = fixture;
  await context.route("**/api/market*", (route) =>
    route.fulfill({ json: response }),
  );
  await page.goto(base, { waitUntil: "networkidle" });
  assert.deepEqual(
    await page.locator(".lj-market-cards strong").allTextContents(),
    ["36只", "17只", "19只", "5板"],
  );
  const chart = page.getByRole("group", { name: "各连板高度的股票数量" });
  assert.equal(await chart.getByRole("button").count(), 5);
  await chart.getByRole("button", { name: "3连板：5只" }).click();
  assert.ok(
    (await page.locator(".lj-chart-readout").innerText()).includes("5 只"),
  );
  await page
    .locator(".lj-chart-tabs")
    .getByRole("button", { name: "行业分布", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("group", { name: "股池前六行业的股票数量" })
      .getByRole("button")
      .count(),
    3,
  );
  report.tasks.push(
    "Chart metrics and selectable bars match the actual supplied pool",
  );

  await page
    .getByRole("navigation", { name: "手机快捷导航" })
    .getByRole("link", { name: "复盘", exact: true })
    .click();
  const firstStock = page.locator(".lj-stock-card").first();
  const star = firstStock.getByRole("button", { name: /^加入自选/ });
  const title = await star.getAttribute("aria-label");
  await star.click();
  assert.equal(
    await firstStock
      .getByRole("button", { name: /^移除自选/ })
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(await page.locator(".lj-watchlist li").count(), 1);
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator(".lj-watchlist li").count(), 1);
  assert.ok(
    (await page.locator(".lj-watchlist li").innerText()).includes(
      title.split("：")[1],
    ),
  );
  const other = await context.newPage();
  await other.goto(base, { waitUntil: "networkidle" });
  assert.equal(await other.locator(".lj-watchlist li").count(), 1);
  await page
    .locator(".lj-watchlist")
    .getByRole("button", { name: /^移除自选/ })
    .click();
  await other.waitForFunction(
    () => document.querySelectorAll(".lj-watchlist li").length === 0,
  );
  await other.close();
  report.tasks.push(
    "Watchlist add/remove survives reload and synchronizes browser tabs",
  );

  await page.getByRole("button", { name: "打开全站研究搜索" }).click();
  assert.equal(await page.getByRole("dialog").count(), 1);
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.getAttribute("aria-label"),
    ),
    "全站研究搜索",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.getAttribute("aria-label"),
    ),
    "打开全站研究搜索",
  );
  await page.keyboard.press("Control+k");
  await page.getByRole("searchbox", { name: "全站研究搜索" }).fill("具身");
  await page.getByRole("searchbox", { name: "全站研究搜索" }).press("Enter");
  await page.getByRole("searchbox", { name: "搜索研究" }).waitFor();
  assert.equal(
    await page.getByRole("searchbox", { name: "搜索研究" }).inputValue(),
    "具身",
  );
  assert.equal(await page.locator(".lj-library-grid a").count(), 1);
  report.tasks.push(
    "Command search focuses input, restores focus, and passes query into research",
  );

  for (const route of [
    "/research/",
    "/research/2026-08-28-a-share-close-review/",
  ]) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.addScriptTag({ path: axeScript });
    const violations = await page.evaluate(async () =>
      (
        await axe.run(document.querySelector(".lj-site"), {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
          },
        })
      ).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    );
    report.accessibility.push({ route, violations });
  }
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "打开全站研究搜索" }).click();
  await page.addScriptTag({ path: axeScript });
  report.accessibility.push({
    route: "search dialog",
    violations: await page.evaluate(async () =>
      (
        await axe.run(document.querySelector(".lj-search-dialog"), {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
          },
        })
      ).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ),
  });
  await page.keyboard.press("Escape");

  // Label screenshots on the image itself so the fixture cannot be mistaken for live markets.
  for (const [name, width, height] of [
    ["desktop", 1440, 1100],
    ["mobile", 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => {
      scrollTo(0, 0);
      const label = document.createElement("div");
      label.textContent = "交互原型 · 以下为演示数据，非真实行情";
      label.id = "prototype-banner";
      Object.assign(label.style, {
        position: "fixed",
        top: "76px",
        left: "0",
        right: "0",
        zIndex: "100",
        background: "#fff1c9",
        color: "#624813",
        textAlign: "center",
        fontSize: "12px",
        padding: "7px",
      });
      document.body.appendChild(label);
    });
    await page.screenshot({ path: `${output}/prototype-${name}.png` });
    await page.evaluate(() =>
      document.querySelector("#prototype-banner").remove(),
    );
  }

  response = {
    ...fixture,
    news: unavailable("news"),
    limitUp: unavailable("pool"),
  };
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator(".lj-chart-bar").count(), 0);
  assert.equal(
    await page.locator(".lj-market-cards strong").first().textContent(),
    "—",
  );
  assert.equal(
    await page
      .locator(
        'script[src*="cloudflareinsights"],script[src*="umami"],script[src*="googletagmanager"]',
      )
      .count(),
    0,
  );
  report.tasks.push(
    "Missing data never generates chart values; no visitor analytics is installed",
  );
  assert.deepEqual(report.errors, []);
  await writeFile(
    `${output}/workspace-checks.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  assert.ok(
    report.accessibility.every((audit) => audit.violations.length === 0),
    "No detected accessibility violations",
  );
} finally {
  await browser.close();
}
