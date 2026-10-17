import Link from 'next/link';
import { SiteHeader, SiteFooter } from './components/site-chrome';
import './capital.css';
export default function NotFound() { return <div className="lj-site"><SiteHeader /><main className="lj-wrap lj-missing"><span className="lj-kicker">404 / 路见资本</span><h1>这条路径，暂未抵达。</h1><p>页面可能已经移动，请返回首页继续阅读。</p><Link className="lj-button lj-button-dark" href="/">返回首页 →</Link></main><SiteFooter /></div>; }
