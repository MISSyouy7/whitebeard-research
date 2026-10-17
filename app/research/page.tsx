import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '../components/site-chrome';
import { ResearchLibrary } from '../components/research-library';
import { getResearchNotes } from '../../lib/research';
import '../capital.css';
export const metadata: Metadata = { title: '研究洞察｜路见资本' };
export default function ResearchPage() {
  const notes = getResearchNotes().map(note => ({ slug: note.slug, title: note.title, summary: note.summary, date: note.date, category: note.category, tags: note.tags, readingMinutes: note.readingMinutes }));
  return <div className="lj-site"><SiteHeader /><main className="lj-wrap lj-library"><span className="lj-kicker">研究档案</span><h1>把变化，读深一层。</h1><p className="lj-library-intro">产业逻辑、市场复盘与持续跟踪。每份研究保留原始日期，沿着证据理解判断。</p><ResearchLibrary notes={notes} /></main><SiteFooter /></div>;
}
