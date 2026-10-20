import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '../components/site-chrome';
import { ResearchLibrary } from '../components/research-library';
import { getResearchCards } from '../../lib/research';
import { PeriodicalUpdate } from '../components/periodical-update';
import '../capital.css';
export const metadata: Metadata = { title: '产业研究与周刊｜路见资本', description: '持续更新的科技周刊、AI前沿与产业专题，沿着技术变化寻找产业线索。' };
export default function ResearchPage() {
  const notes = getResearchCards();
  return <div className="lj-site"><SiteHeader /><main className="lj-wrap lj-library"><span className="lj-kicker">产业研究 / 周刊与专题</span><h1>把变化，读深一层。</h1><p className="lj-library-intro">从技术进展到产业变化。阅读每期周刊，沿着感兴趣的方向继续研究。</p><PeriodicalUpdate /><ResearchLibrary notes={notes} /></main><SiteFooter /></div>;
}
