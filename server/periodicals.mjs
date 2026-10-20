export const publications = [
  { id: 'tech-weekly', name: '科技爱好者周刊', category: '科技周刊', repo: 'ruanyf/weekly', branch: 'master' },
  { id: 'ai-papers', name: 'AI 论文周报', category: 'AI前沿', repo: 'careywyr/AI-Weekly-Paper', branch: 'main' },
];

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
export const validDate = value => typeof value === 'string' && datePattern.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const validTime = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const clean = value => String(value).replace(/<[^>]*>/g, '').replace(/[\r\n\t]+/g, ' ').trim();

export function techIssues(markdown) {
  const issues = [...markdown.matchAll(/第\s*(\d+)\s*期[：:]\s*\[([^\]\n]+)\]\((docs\/issue-\d+\.md)\)/g)]
    .filter(match => match[3] === `docs/issue-${match[1]}.md`)
    .map(match => ({ path: match[3], number: Number(match[1]), title: `科技爱好者周刊 · 第 ${match[1]} 期｜${clean(match[2])}` }));
  return [...new Map(issues.map(item => [item.path, item])).values()].sort((a, b) => b.number - a.number);
}

export function paperIssues(files, year, today) {
  if (!Array.isArray(files)) throw new Error('AI weekly file list is invalid');
  return files.flatMap(file => {
    const match = file.name?.match(/^(\d{2})(\d{2})-(\d{2})(\d{2})\.md$/);
    if (file.type !== 'file' || !match || file.path !== `${year}/${file.name}`) return [];
    const [, startMonth, startDay, endMonth, endDay] = match;
    const end = `${year}-${endMonth}-${endDay}`;
    const startYear = startMonth > endMonth ? year - 1 : year;
    const start = `${startYear}-${startMonth}-${startDay}`;
    if (!validDate(start) || !validDate(end) || end > today || start > end || Date.parse(end) - Date.parse(start) > 7 * 86400000) return [];
    return [{ path: file.path, periodEnd: end, title: `AI 论文周报｜${start} — ${end}` }];
  }).sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
}

export function topicTags(markdown) {
  const topics = [
    ['智能体', /智能体|\bagent(?:ic|s)?\b/i],
    ['具身智能', /具身|机器人|robot(?:ics)?|embodied/i],
    ['多模态', /多模态|multimodal|multi-modal/i],
    ['视频生成', /视频生成|video generation/i],
    ['算力', /算力|\bGPU\b|芯片|半导体/i],
    ['大模型', /大模型|语言模型|\bLLM\b/i],
    ['开源生态', /开源|open.source/i],
  ];
  return topics.filter(([, pattern]) => pattern.test(markdown)).slice(0, 4).map(([name]) => name);
}

export function validSnapshot(data) {
  if (data?.version !== 1 || !validTime(data.checkedAt) || !Array.isArray(data.publications) || data.publications.length !== publications.length) return false;
  return publications.every(source => {
    const matches = data.publications.filter(item => item.id === source.id);
    if (matches.length !== 1) return false;
    const item = matches[0];
    if (!['ok', 'stale', 'unavailable'].includes(item.status) || !Array.isArray(item.items) || item.items.length > 4) return false;
    if (item.status === 'unavailable') return item.items.length === 0 && item.fetchedAt === null;
    if (!validTime(item.fetchedAt) || !item.items.length || new Set(item.items.map(entry => entry.id)).size !== item.items.length) return false;
    return item.items.every(entry => {
      const prefix = `https://github.com/${source.repo}/blob/${source.branch}/`;
      const path = typeof entry.url === 'string' && entry.url.startsWith(prefix) ? entry.url.slice(prefix.length) : '';
      const validPath = source.id === 'tech-weekly' ? /^docs\/issue-\d+\.md$/.test(path) : /^\d{4}\/\d{4}-\d{4}\.md$/.test(path);
      return validPath && entry.id === `${source.id}:${path}` && validDate(entry.date)
        && entry.date <= item.fetchedAt.slice(0, 10)
        && typeof entry.title === 'string' && entry.title.length > 0 && entry.title.length <= 220
        && typeof entry.summary === 'string' && entry.summary.length <= 300
        && Array.isArray(entry.tags) && entry.tags.length <= 4 && entry.tags.every(tag => typeof tag === 'string' && tag.length <= 30);
    });
  });
}

export function createGithubReader({ fetcher = fetch, token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN } = {}) {
  return async (source, route) => {
    const response = await fetcher(`https://api.github.com/repos/${source.repo}/${route}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'lujian-periodicals', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(15000), redirect: 'error',
    });
    if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
    return response.json();
  };
}

function markdownFile(value) {
  if (value?.type !== 'file' || value.encoding !== 'base64' || typeof value.content !== 'string' || value.content.length > 3_000_000) throw new Error('Invalid Markdown response');
  return Buffer.from(value.content, 'base64').toString('utf8');
}

export async function collectPublication(source, { reader = createGithubReader(), now = new Date() } = {}) {
  const today = now.toISOString().slice(0, 10);
  let issues;
  if (source.id === 'tech-weekly') {
    issues = techIssues(markdownFile(await reader(source, 'contents/README.md')));
  } else {
    const year = now.getUTCFullYear();
    // Include the previous year, including early January before a new folder exists.
    const lists = await Promise.allSettled([year, year - 1].map(async value => paperIssues(await reader(source, `contents/${value}`), value, today)));
    issues = lists.flatMap(result => result.status === 'fulfilled' ? result.value : []).sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
    if (lists[0].status === 'rejected' && now.getUTCMonth() > 0) throw lists[0].reason;
  }
  if (!issues.length) throw new Error('No valid periodical issues found');
  const items = await Promise.all(issues.slice(0, 4).map(async issue => {
    const [document, commits] = await Promise.all([
      reader(source, `contents/${issue.path}`),
      reader(source, `commits?path=${encodeURIComponent(issue.path)}&per_page=1`),
    ]);
    const markdown = markdownFile(document);
    const updated = commits?.[0]?.commit?.committer?.date;
    if (!validTime(updated) || Date.parse(updated) > +now) throw new Error('Missing or future publication update date');
    const tags = topicTags(markdown);
    const papers = [...markdown.matchAll(/^##\s+\S/gm)].length;
    if (source.id === 'ai-papers' && !papers) throw new Error('AI weekly issue has no papers');
    return {
      id: `${source.id}:${issue.path}`, title: issue.title, date: updated.slice(0, 10),
      url: `https://github.com/${source.repo}/blob/${source.branch}/${issue.path}`,
      summary: source.id === 'ai-papers'
        ? `本期收录 ${papers} 篇论文${tags.length ? `，涉及${tags.join('、')}` : ''}。阅读中文解读，进一步查看论文与研究项目。`
        : `本期科技动态、文章与资源选读${tags.length ? `，涵盖${tags.join('、')}` : ''}。从技术与产品的变化中，寻找值得跟踪的产业线索。`,
      tags: tags.length ? tags : ['科技观察'],
    };
  }));
  return { ...source, status: 'ok', fetchedAt: now.toISOString(), items };
}

export async function collectPeriodicals({ previous, loader = collectPublication, now = new Date(), logger = console } = {}) {
  const snapshot = {
    version: 1, checkedAt: now.toISOString(), publications: await Promise.all(publications.map(async source => {
      try { return await loader(source, { now }); }
      catch (error) {
        logger.warn(`::warning::${source.name} did not refresh: ${error.message}`);
        const retained = validSnapshot(previous) && previous.publications.find(item => item.id === source.id && item.items.length);
        return retained ? { ...retained, status: 'stale' } : { ...source, status: 'unavailable', fetchedAt: null, items: [] };
      }
    })),
  };
  if (!validSnapshot(snapshot)) throw new Error('Invalid periodicals snapshot; existing data will not be replaced');
  return snapshot;
}
