import { getMainlines, getPublicResearch } from './content';
import periodicals from '../public/data/periodicals.json';
import { validSnapshot } from '../server/periodicals.mjs';
import { periodicalGuide, periodicalSlug } from './periodical-reading.mjs';
export type PublicNote = { slug: string; title: string; summary: string; date: string; category: string; content: string; tags: string[]; readingMinutes: number; publication?: string; sourceUrl?: string };
export type ResearchCardItem = Omit<PublicNote, 'content' | 'sourceUrl'>;
export function getResearchNotes(): PublicNote[] {
  return [
    ...getPeriodicalState().publications.flatMap(source => source.items.map(item => ({
      slug: periodicalSlug(item.id), title: item.title, summary: item.summary,
      date: item.date, category: source.category, tags: item.tags,
      content: periodicalGuide(item, source.name), publication: source.name, sourceUrl: item.url,
    }))),
    ...getPublicResearch().filter(note => note.categorySlug !== 'market-review' && note.reportType !== 'market').map(note => ({ slug: note.slug, title: note.title, summary: note.description, date: note.date, category: note.category, content: note.content, tags: note.tags })),
    ...getMainlines().map(note => ({ slug: note.slug, title: note.title, summary: note.summary, date: note.date, category: '产业主线', content: note.content + '\n\n## 后续跟踪指标\n\n' + note.trackingIndicators.map(item => `- ${item}`).join('\n') + '\n\n## 风险与证伪\n\n' + note.risks.concat(note.falsification).map(item => `- ${item}`).join('\n') + '\n\n## 来源\n\n' + note.sources.map(item => `- ${item}`).join('\n'), tags: [note.industry, note.currentStage] })),
  ].map(note => ({ ...note, readingMinutes: Math.max(1, Math.ceil(note.content.replace(/\s/g, '').length / 450)) })).sort((a, b) => b.date.localeCompare(a.date));
}

export function getPeriodicalState() {
  if (!validSnapshot(periodicals)) throw new Error('Periodical snapshot is invalid. Run pnpm periodicals:update.');
  return periodicals;
}

export function getResearchCards(): ResearchCardItem[] {
  return getResearchNotes().map(note => ({ slug: note.slug, title: note.title, summary: note.summary, date: note.date, category: note.category, tags: note.tags, readingMinutes: note.readingMinutes, publication: note.publication }));
}
