import Link from 'next/link';

export function Brand({ small = false }: { small?: boolean }) {
  return <Link href="/" className={`lj-brand${small ? ' lj-brand-small' : ''}`} aria-label="路见资本首页">
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M9 7v34h32M20 7v23h21M31 7v12h10" stroke="currentColor" strokeWidth="2.4" /></svg>
    <span><strong>路见资本</strong><small>LUJIAN CAPITAL</small></span>
  </Link>;
}
export function SiteHeader() {
  return <header className="lj-header"><div className="lj-wrap lj-nav-inner"><Brand />
    <nav aria-label="主导航"><Link href="/#news">热点新闻</Link><Link href="/#limit-up">涨停复盘</Link><Link href="/research/">研究洞察</Link><Link href="/#about">关于路见</Link></nav>
    <Link className="lj-nav-cta" href="/#follow">与路见同行 <span aria-hidden="true">↗</span></Link>
  </div></header>;
}
export function SiteFooter() {
  return <footer className="lj-footer" id="follow"><div className="lj-wrap">
    <div className="lj-footer-top"><div><Brand small /><p>看见产业的变化，理解资本的选择。</p></div><div className="lj-follow"><span>保持独立思考，保持持续观察。</span><strong>微信公众号 · 路见资本</strong><small>在微信搜索「路见资本」，阅读最新研究。</small></div></div>
    <div className="lj-footer-bottom"><span>© {new Date().getUTCFullYear()} 路见资本 · 仅作研究交流，不构成投资建议。</span><div><Link href="/research/">研究档案</Link><Link href="/mirror/">股市照妖镜 ↗</Link></div></div>
  </div></footer>;
}
export function SectionTitle({ index, english, title, children }: { index: string; english: string; title: string; children?: React.ReactNode }) {
  return <div className="lj-section-title"><div><span className="lj-kicker">{index} / {english}</span><h2>{title}</h2></div>{children}</div>;
}
