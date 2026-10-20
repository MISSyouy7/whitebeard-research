import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectPeriodicals, collectPublication, createGithubReader, paperIssues, publications, techIssues, validSnapshot } from '../server/periodicals.mjs';
import { updatePeriodicals } from '../scripts/update-periodicals.mjs';
import { extractReadingIndex, periodicalGuide, periodicalSlug } from '../lib/periodical-reading.mjs';

const now = new Date('2026-10-20T01:00:00Z');
const silent = { log() {}, warn() {} };
const markdown = text => ({ type: 'file', encoding: 'base64', content: Buffer.from(text).toString('base64') });
const fixture = (time = '2026-10-19T01:00:00.000Z') => ({ version: 1, checkedAt: time, publications: publications.map(source => {
  const file = source.id === 'tech-weekly' ? 'docs/issue-415.md' : '2026/1012-1016.md';
  return { ...source, status: 'ok', fetchedAt: time, items: [{ id: `${source.id}:${file}`, title: '测试期刊', summary: '测试摘要', date: '2026-10-16', tags: ['AI'], url: `https://github.com/${source.repo}/blob/${source.branch}/${file}` }] };
}) });

test('tech index deduplicates and ignores mismatched issue numbers and unsafe links', () => {
  const parsed = techIssues('- 第 414 期：[旧刊](docs/issue-414.md)\n- 第 415 期：[新刊](docs/issue-415.md)\n- 第 415 期：[重复](docs/issue-415.md)\n- 第 900 期：[错号](docs/issue-899.md)\n- 第 901 期：[外链](https://bad.example/a.md)');
  assert.deepEqual(parsed.map(item => item.number), [415, 414]);
});

test('AI issue periods handle New Year and reject future, invalid and mismatched paths', () => {
  const files = ['1229-0102', '1012-1016', '1026-1030', '0230-0301', '0901-0930'].map(name => ({ name: `${name}.md`, type: 'file', path: `2026/${name}.md` }));
  files.push({ name: '1012-1016.md', type: 'file', path: '../1012-1016.md' });
  const parsed = paperIssues(files, 2026, '2026-10-20');
  assert.deepEqual(parsed.map(item => item.periodEnd), ['2026-10-16', '2026-01-02']);
  assert.match(parsed[1].title, /2025-12-29 — 2026-01-02/);
});

test('collector uses actual file update dates and titles; content is never rendered as HTML', async () => {
  const item = await collectPublication(publications[0], { now, reader: async (_, route) => {
    if (route === 'contents/README.md') return markdown('- 第 415 期：[<script>bad</script>AI](docs/issue-415.md)');
    if (route.startsWith('commits?')) return [{ commit: { committer: { date: '2026-10-16T01:00:00Z' } } }];
    return markdown('# AI\n\n智能体与开源生态');
  } });
  assert.equal(item.items[0].date, '2026-10-16');
  assert.equal(item.fetchedAt, now.toISOString());
  assert.ok(!item.items[0].title.includes('<'));
  assert.deepEqual(item.items[0].tags, ['智能体', '开源生态']);
  assert.equal(item.items[0].content, undefined);
});

test('missing/future commit dates and malformed GitHub content fail collection', async () => {
  for (const date of [undefined, 'tomorrow', '2026-10-21T00:00:00Z']) {
    await assert.rejects(collectPublication(publications[0], { now, reader: async (_, route) => {
      if (route === 'contents/README.md') return markdown('- 第 415 期：[AI](docs/issue-415.md)');
      return route.startsWith('commits?') ? [{ commit: { committer: { date } } }] : markdown('# 正文');
    } }));
  }
  await assert.rejects(collectPublication(publications[0], { now, reader: async () => '<html>denied</html>' }));
});

test('one failed publication retains its issues and acquisition time while the other refreshes', async () => {
  const previous = fixture();
  const result = await collectPeriodicals({ previous, now, logger: silent, loader: async source => {
    if (source.id === 'tech-weekly') throw new Error('upstream unavailable');
    return { ...previous.publications[1], fetchedAt: now.toISOString() };
  } });
  assert.equal(result.publications[0].status, 'stale');
  assert.deepEqual(result.publications[0].items, previous.publications[0].items);
  assert.equal(result.publications[0].fetchedAt, previous.publications[0].fetchedAt);
  assert.equal(result.publications[1].status, 'ok');
  assert.equal(result.publications[1].fetchedAt, now.toISOString());
});

test('an initial failure yields an honest unavailable state, never invented issues', async () => {
  const result = await collectPeriodicals({ now, logger: silent, loader: async () => { throw new Error('offline'); } });
  assert.ok(validSnapshot(result));
  assert.ok(result.publications.every(source => source.status === 'unavailable' && source.items.length === 0 && source.fetchedAt === null));
});

test('snapshot validation rejects unsafe links, duplicate issues, unknown sources and future article dates', () => {
  assert.ok(validSnapshot(fixture()));
  for (const mutate of [
    data => { data.publications[0].items[0].url = 'javascript:alert(1)'; },
    data => { data.publications[0].items[0].url = 'https://github.com.evil.example/ruanyf/weekly/blob/master/docs/issue-415.md'; },
    data => { data.publications[0].items.push(data.publications[0].items[0]); },
    data => { data.publications[0].id = 'unknown'; },
    data => { data.publications[0].items[0].date = '2026-10-22'; },
  ]) { const data = fixture(); mutate(data); assert.equal(validSnapshot(data), false); }
});

test('GitHub credentials are scoped to the configured API request and redirects are rejected', async () => {
  let request;
  const reader = createGithubReader({ token: 'test-only', fetcher: async (url, settings) => {
    request = { url, settings };
    return new Response('{}');
  } });
  await reader(publications[0], 'contents/README.md');
  assert.equal(new URL(request.url).hostname, 'api.github.com');
  assert.equal(request.settings.redirect, 'error');
  assert.equal(request.settings.headers.Authorization, 'Bearer test-only');
});

test('daily builds restore newer published data before a failed upstream refresh', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'periodicals-'));
  const destination = path.join(directory, 'snapshot.json');
  try {
    const old = fixture('2026-10-17T01:00:00.000Z');
    const remote = fixture('2026-10-19T01:00:00.000Z');
    remote.publications[0].items[0].title = '线上较新的期刊';
    await writeFile(destination, JSON.stringify(old));
    const result = await updatePeriodicals({ destination, restoreURL: 'https://example.com/snapshot.json', requireData: true, logger: silent,
      fetcher: async () => new Response(JSON.stringify(remote)),
      collector: options => collectPeriodicals({ ...options, now, loader: async () => { throw new Error('offline'); } }),
    });
    assert.equal(result.publications[0].items[0].title, '线上较新的期刊');
    assert.equal(result.publications[0].fetchedAt, remote.publications[0].fetchedAt);
    assert.equal(result.publications[0].status, 'stale');
    assert.deepEqual(JSON.parse(await readFile(destination, 'utf8')), result);
    await assert.rejects(updatePeriodicals({ destination, collector: async () => ({}), logger: silent }));
    assert.deepEqual(JSON.parse(await readFile(destination, 'utf8')), result);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('site reading indexes keep Chinese titles and safe references without copying article bodies', () => {
  const reading = extractReadingIndex('## A paper\n\n[中文标题](https://arxiv.org/abs/2610.12345)\n\n这是不应整段转载的原文。\n\n[坏链接](javascript:alert(1))\n\n[重复](https://arxiv.org/abs/2610.12345)', true);
  assert.equal(reading.entries.length, 1);
  assert.equal(reading.entries[0].url, 'https://arxiv.org/abs/2610.12345');
  assert.ok(!JSON.stringify(reading).includes('这是不应整段转载'));
  assert.equal(extractReadingIndex('1、[测试工具](https://example.com/tool)', false).entries.length, 1);
  const item = { ...fixture().publications[0].items[0], reading, tags: ['大模型'] };
  const content = periodicalGuide(item, '测试周刊');
  assert.match(content, /本期导读/);
  assert.match(content, /产业观察/);
  assert.match(content, /本期篇目/);
  assert.ok(!content.includes('这是不应整段转载'));
  assert.match(periodicalGuide({ ...item, reading: undefined }, '旧快照'), /本期导读/);
});

test('each edition gets a stable site path and unsafe reading metadata is rejected', () => {
  assert.equal(periodicalSlug('tech-weekly:docs/issue-415.md'), 'weekly-tech-415');
  assert.equal(periodicalSlug('ai-papers:2026/1012-1016.md'), 'weekly-ai-2026-1012-1016');
  assert.throws(() => periodicalSlug('tech-weekly:../../secret'));
  for (const url of [undefined, 'javascript:alert(1)', 'https://user:pass@example.com/']) {
    const data = fixture();
    data.publications[0].items[0].reading = { sections: [], entries: [{ title: '测试', url }] };
    assert.equal(validSnapshot(data), false);
  }
});
