import Link from 'next/link';
import { SiteHeader, SiteFooter, SectionTitle } from './components/site-chrome';
import { MarketDashboard } from './components/market-dashboard';
import { getResearchCards } from '../lib/research';
import { ResearchCard } from './components/research-card';
import { PeriodicalUpdate } from './components/periodical-update';
import './capital.css';
export default function Home() {
  const notes = getResearchCards();
  const featured = ['AI前沿', '科技周刊', '产业主线'].map(category => notes.find(note => note.category === category));
  return <div className="lj-site" id="top"><a className="lj-skip" href="#main-content">跳到正文</a><SiteHeader /><main id="main-content">
    <MarketDashboard />
    <section className="lj-research lj-wrap" id="research"><SectionTitle index="03" eyebrow="周刊与专题" title="产业研究"><Link className="lj-text-link" href="/research/">全部周刊与研究 <span aria-hidden="true">↗</span></Link></SectionTitle>
      <PeriodicalUpdate />
      <div className="lj-research-grid">{featured.map(note => note && <ResearchCard key={note.slug} note={note} heading="h3" />)}</div>
    </section>
    <section className="lj-about lj-wrap" id="about"><div><span className="lj-kicker">04 / 关于路见</span><h2>不止看见行情，<br /><span>更要读懂生意。</span></h2></div><div><p>路见资本，持续记录产业周期、资金迁徙与市场情绪。我们相信，有价值的研究来自可追溯的事实，也来自对自身判断的不断修正。</p><div className="lj-principles"><span><b>01</b>事实有来源</span><span><b>02</b>判断有依据</span><span><b>03</b>结论可验证</span></div></div></section>
  </main><SiteFooter /></div>;
}
