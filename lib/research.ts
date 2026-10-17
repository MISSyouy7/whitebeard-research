import { getMainlines, getPublicResearch } from './content';
export type PublicNote = { slug: string; title: string; summary: string; date: string; category: string; content: string; tags: string[] };
export function getResearchNotes(): PublicNote[] {
  return [
    ...getPublicResearch().map(note => ({ slug: note.slug, title: note.title, summary: note.description, date: note.date, category: note.category, content: note.content, tags: note.tags })),
    ...getMainlines().map(note => ({ slug: note.slug, title: note.title, summary: note.summary, date: note.date, category: '产业主线', content: note.content + '\n\n## 后续跟踪指标\n\n' + note.trackingIndicators.map(item => `- ${item}`).join('\n') + '\n\n## 风险与证伪\n\n' + note.risks.concat(note.falsification).map(item => `- ${item}`).join('\n') + '\n\n## 来源\n\n' + note.sources.map(item => `- ${item}`).join('\n'), tags: [note.industry, note.currentStage] })),
  ].sort((a, b) => b.date.localeCompare(a.date));
}
