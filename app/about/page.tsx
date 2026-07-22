import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import Link from "next/link";

export const metadata: Metadata = { title: "关于研究院", description: "认识白胡子研究院的研究原则与内容边界。" };

export default function AboutPage() {
  return <><SiteHeader /><main className="about-page section-shell">
    <header className="page-masthead"><p>ABOUT / WHITEBEARD</p><h1>关于研究院</h1><span>独立思考是一种需要长期练习的手艺。</span></header>
    <section className="about-intro"><div className="about-big">白<br />胡<br />子</div><div><h2>我们为什么写研究？</h2><p>信息越来越多，真正稀缺的却是对问题的耐心。白胡子研究院希望搭建一个开放的研究档案：不把观点包装成结论，不把相关性误写成因果，也不在噪声里制造确定感。</p><p>我们记录事实、框架、判断和反方证据，让每篇文章都能在时间里被复查。</p></div></section>
    <section className="about-values"><div><b>01</b><h3>区分事实与判断</h3><p>引用可以核验，假设清楚标注，结论保留边界。</p></div><div><b>02</b><h3>寻找关键变量</h3><p>比预测价格更重要的，是知道什么变化会改变判断。</p></div><div><b>03</b><h3>欢迎反方证据</h3><p>好的研究不是证明自己正确，而是更快发现哪里可能错。</p></div></section>
    <section className="about-cta"><p>保持好奇，尊重事实，延迟判断。</p><Link className="primary-button button-dark" href="/articles">开始阅读 <span>→</span></Link></section>
  </main><SiteFooter /></>;
}
