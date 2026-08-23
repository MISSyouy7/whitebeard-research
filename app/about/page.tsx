import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = { title: "关于路见资本", description: "认识路见资本的资本观察系统、研究原则、内容边界与长期定位。" };

export default function AboutPage() {
  return <><SiteHeader /><main className="about-page section-shell">
    <header className="page-masthead"><p>ABOUT / LUJIAN CAPITAL</p><h1>关于路见资本</h1><span>一套持续记录资金、产业与情绪的资本观察系统。</span></header>
    <section className="about-intro lujian-about-intro"><div className="about-big">路<br />见<br />资<br />本</div><div><h2>看见资本流向，<br />理解产业周期，<br />记录市场情绪。</h2><p>路见资本面向个人投资者，长期记录资金迁徙、产业生命周期、A股研究与市场情绪。这里不追求每天给出答案，而是把结论背后的事实、口径、反方证据和证伪条件留下来。</p><p>主理人广路从产业链、公司与财务验证出发：先区分概念、送样、认证、订单、收入和现金流，再讨论一个变化是否真正进入上市公司经营结果。</p></div></section>
    <section className="about-values"><div><b>01</b><h3>事实优先</h3><p>重要数据保留来源与时间，事实、判断和推测分开记录。</p></div><div><b>02</b><h3>资金迁徙</h3><p>研究资金从哪里来、往哪里去、为什么变化，以及下一次看什么验证。</p></div><div><b>03</b><h3>允许证伪</h3><p>每个核心判断都保留反方观点、风险和可观察的失效条件。</p></div></section>
    <section className="about-system-map"><header><span>CAPITAL OBSERVATION SYSTEM</span><h2>一张长期更新的研究地图</h2></header><div><Link href="/capital-flow"><b>01</b><h3>资金迁徙</h3><p>记录交易日资金方向与连续性。</p></Link><Link href="/mainline"><b>02</b><h3>主线生命</h3><p>追踪产业阶段、证据和证伪条件。</p></Link><Link href="/board"><b>03</b><h3>A股棋盘</h3><p>交叉观察产业位置与资金强弱。</p></Link><Link href="/articles"><b>04</b><h3>研究文章</h3><p>沉淀公开研究与星球试读。</p></Link></div></section>
    <section className="about-boundary"><div><span>研究边界</span><h2>不以收益率证明研究，<br />也不把研究包装成指令。</h2></div><div><p>本站不提供实时喊单、具体买卖点、收益承诺、仓位指令或个人持仓复制。公司名称只用于研究映射，任何历史数据都不代表未来表现。</p><p>“她的资本视角”以专业、克制、温暖的方式讨论财务自主和风险，不使用性别刻板印象，也不假设女性不懂金融。</p></div></section>
    <section className="about-cta"><p>结论可以变化，证据必须留下。</p><Link className="capital-primary" href="/capital-flow">从资金迁徙开始 <span>→</span></Link></section>
  </main><SiteFooter /></>;
}
