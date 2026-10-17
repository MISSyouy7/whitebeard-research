import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader, SiteFooter, SectionTitle } from './components/site-chrome';
import { MarketDashboard } from './components/market-dashboard';
import { getResearchNotes } from '../lib/research';
import './capital.css';
export default function Home() {
  const notes = getResearchNotes();
  const featured = [notes.find(note => note.category === '产业主线'), ...notes.filter(note => note.category !== '产业主线').slice(0, 2)].filter(Boolean);
  return <div className="lj-site"><a className="lj-skip" href="#main-content">跳到正文</a><SiteHeader /><main id="main-content">
    <section className="lj-hero lj-wrap" aria-labelledby="hero-title">
      <div className="lj-hero-copy"><div className="lj-kicker"><span className="lj-rule" /> INDEPENDENT THINKING. LONG-TERM VISION.</div>
        <h1 id="hero-title">于喧嚣处，<br />看见资本的<span>方向。</span></h1><p className="lj-hero-description">穿透市场的表象，追踪产业的变迁。<br />以事实为起点，理解每一次资金的选择。</p>
        <div className="lj-hero-actions"><a className="lj-button lj-button-dark" href="#limit-up">进入市场观察 <span aria-hidden="true">↗</span></a><Link className="lj-text-link" href="/research/">阅读研究洞察 <span aria-hidden="true">→</span></Link></div>
        <div className="lj-hero-foot"><span>产业逻辑</span><i /><span>资金流向</span><i /><span>市场情绪</span></div>
      </div><div className="lj-hero-visual"><Image src="/brand/horizon.svg" alt="山脊与向远方延伸的金色路径，寓意穿越周期、寻找方向" width={800} height={820} priority unoptimized /><div className="lj-art-top"><span>THE LONG VIEW</span><span>路 · 见</span></div><div className="lj-art-bottom"><span>在变化之中<br />寻找不变的逻辑</span><small>A PERSPECTIVE BEYOND THE NOISE</small></div></div>
    </section>
    <div className="lj-positioning"><div className="lj-wrap"><strong>独立研究，持续验证。</strong><p>从一条新闻，到一条产业链，再到一份值得追踪的判断。</p><span>LUJIAN / RESEARCH & INSIGHTS</span></div></div>
    <MarketDashboard />
    <section className="lj-research lj-wrap" id="research"><SectionTitle index="03" english="RESEARCH & INSIGHTS" title="研究洞察"><Link className="lj-text-link" href="/research/">全部研究 <span aria-hidden="true">↗</span></Link></SectionTitle>
      <div className="lj-research-grid">{featured.map((note, i) => note && <Link className="lj-research-card" key={note.slug} href={`/research/${note.slug}/`}><div className="lj-card-top"><span>{note.category}</span><span className="lj-note-number">0{i + 1}</span></div><h3>{note.title}</h3><p>{note.summary.replace(/【事实】|【判断】/g, '')}</p><div className="lj-card-bottom"><time dateTime={note.date}>{note.date.replaceAll('-', '.')}</time><span aria-label="阅读全文">↗</span></div></Link>)}</div>
    </section>
    <section className="lj-about lj-wrap" id="about"><div><span className="lj-kicker">04 / OUR PERSPECTIVE</span><h2>不止看见行情，<br /><span>更要读懂生意。</span></h2></div><div><p>路见资本，持续记录产业周期、资金迁徙与市场情绪。我们相信，有价值的研究来自可追溯的事实，也来自对自身判断的不断修正。</p><div className="lj-principles"><span><b>01</b>事实有来源</span><span><b>02</b>判断有依据</span><span><b>03</b>结论可验证</span></div></div></section>
  </main><SiteFooter /></div>;
}
