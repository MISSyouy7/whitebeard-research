import Link from 'next/link';
import { SiteHeader, SiteFooter, SectionTitle } from './components/site-chrome';
import { MarketDashboard } from './components/market-dashboard';
import { GlassHero } from './components/glass-hero';
import { getResearchNotes } from '../lib/research';
import './capital.css';
export default function Home() {
  const notes = getResearchNotes();
  const featured = [notes.find(note => note.category === '产业主线'), ...notes.filter(note => note.category !== '产业主线').slice(0, 2)].filter(Boolean);
  return <div className="lj-site" id="top"><a className="lj-skip" href="#main-content">跳到正文</a><SiteHeader /><main id="main-content">
    <GlassHero />
    <nav className="lj-workspace-tabs lj-wrap" aria-label="工作台快捷入口"><a href="#overview" className="is-current">市场总览</a><a href="#news">7×24 快讯</a><a href="#limit-up">涨停复盘</a><Link href="/research/">研究洞察</Link><span>A股 · 北京时间</span></nav>
    <MarketDashboard />
    <section className="lj-research lj-wrap" id="research"><SectionTitle index="03" english="RESEARCH & INSIGHTS" title="研究洞察"><Link className="lj-text-link" href="/research/">全部研究 <span aria-hidden="true">↗</span></Link></SectionTitle>
      <div className="lj-research-grid">{featured.map((note, i) => note && <Link className="lj-research-card" key={note.slug} href={`/research/${note.slug}/`}><div className="lj-card-top"><span>{note.category}</span><span className="lj-note-number">0{i + 1}</span></div><h3>{note.title}</h3><p>{note.summary.replace(/【事实】|【判断】/g, '')}</p><div className="lj-card-bottom"><time dateTime={note.date}>{note.date.replaceAll('-', '.')}</time><span aria-label="阅读全文">↗</span></div></Link>)}</div>
    </section>
    <section className="lj-about lj-wrap" id="about"><div><span className="lj-kicker">04 / OUR PERSPECTIVE</span><h2>不止看见行情，<br /><span>更要读懂生意。</span></h2></div><div><p>路见资本，持续记录产业周期、资金迁徙与市场情绪。我们相信，有价值的研究来自可追溯的事实，也来自对自身判断的不断修正。</p><div className="lj-principles"><span><b>01</b>事实有来源</span><span><b>02</b>判断有依据</span><span><b>03</b>结论可验证</span></div></div></section>
  </main><SiteFooter /></div>;
}
