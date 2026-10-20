// Keep the on-site edition an original reading guide and a title index.
// Third-party article bodies and illustrations are not republished.
export const readingText = value => String(value).replace(/<[^>]*>/g, '').replace(/%%(?:CODE|IMAGE|LINK)\d+%%/g, '').replace(/[\[\]`*_!\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 200);

export function readingLink(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export function extractReadingIndex(markdown, paperMode) {
  const entries = [];
  const sections = [];
  for (const line of markdown.split('\n')) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) sections.push(readingText(heading[1]));
    const link = paperMode
      ? line.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\s*$/)
      : line.match(/^\d+[、.]\s*(?:\*\*)?\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    if (link) {
      const title = readingText(link[1]);
      const url = readingLink(link[2]);
      if (title && url) entries.push({ title, url });
    }
  }
  return {
    sections: [...new Set(sections.filter(Boolean))].slice(0, 120),
    entries: [...new Map(entries.map(entry => [entry.url, entry])).values()].slice(0, 120),
  };
}

export function periodicalSlug(id) {
  const tech = id.match(/^tech-weekly:docs\/issue-(\d+)\.md$/);
  if (tech) return `weekly-tech-${tech[1]}`;
  const paper = id.match(/^ai-papers:(\d{4})\/(\d{4}-\d{4})\.md$/);
  if (paper) return `weekly-ai-${paper[1]}-${paper[2]}`;
  throw new Error('Unknown periodical identity');
}

const observations = {
  '智能体': '把自动执行任务的能力拆开看：能否稳定调用工具、处理中途失败、完成多步任务。产业价值需要进一步核验任务完成率、人工接管次数，以及每次成功交付的成本。',
  '具身智能': '从模型走向真实设备，通常还要经过感知、控制和安全验证。阅读时可关注演示场景是否受限、换环境后能否工作，以及真实部署需要多少维护和训练数据。',
  '多模态': '同时处理文字、图像、声音，并不自动意味着能解决业务问题。更值得追问的是：哪一种信息减少了错误，是否必须收集新数据，效果提升能否覆盖计算和数据成本。',
  '视频生成': '判断视频工具的实用性，可以分别观察画面质量、跨镜头一致性、可修改程度和生成耗时。能够进入生产流程，还取决于返工次数、素材授权和与现有工具的衔接。',
  '算力': '算力需求要结合具体负载分析。训练与推理、峰值与平均利用率、设备采购与持续运行费用，是不同的问题。技术指标改善到供应链利润增长之间，仍需要订单和经营数据验证。',
  '大模型': '模型能力、运行成本和使用门槛应放在一起比较。阅读新方法时，可检查基准是否一致、提升是否适用于真实任务，以及部署条件能否被普通企业满足。',
  '开源生态': '开源项目提供了观察技术扩散的窗口。评估应用前可关注维护频率、许可证、兼容性和迁移成本，再确认企业是否愿意为集成、托管或服务付费。',
};

export function periodicalGuide(item, publication) {
  const index = item.reading || { sections: [], entries: [] };
  const paragraphs = [
    '# 本期导读',
    `${readingText(item.summary)} 本页整理本期阅读线索与篇目目录，并补充产业观察问题，便于在站内先建立阅读框架。`,
    `本期刊物：${readingText(publication)}。条目更新日期：${item.date}。`,
    '# 产业观察',
    '以下是路见整理的阅读问题，用来区分技术进展、产品可用性与商业兑现；不代表本期论文或原作者已经验证了这些商业结果。',
  ];
  for (const topic of item.tags) {
    if (observations[topic]) paragraphs.push(`## ${topic}`, observations[topic]);
  }
  if (index.entries.length) {
    paragraphs.push('# 本期篇目', `收录 ${index.entries.length} 个篇目标题。可先浏览感兴趣的方向，再按需打开具体论文或项目资料。`);
    paragraphs.push(...index.entries.map((entry, i) => `${i + 1}. ${readingText(entry.title)} · [延伸资料](${entry.url})`));
  } else if (index.sections.length) {
    paragraphs.push('# 本期目录', ...index.sections.map(title => `- ${readingText(title)}`));
  }
  paragraphs.push('# 继续跟踪', '阅读后可以留下三个问题：这项技术解决了谁的问题？用户是否愿意持续付费？成本、可靠性和交付条件是否已经具备？把下一次观察建立在可核验的产品与经营信息上。');
  return paragraphs.join('\n\n');
}
