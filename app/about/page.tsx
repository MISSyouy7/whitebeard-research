import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import Link from "next/link";

export const metadata: Metadata = { title: "关于研究院", description: "认识白胡子研究院的长期定位、研究原则与内容边界。" };

export default function AboutPage() {
  return <><SiteHeader /><main className="about-page section-shell">
    <header className="page-masthead"><p>ABOUT / WHITEBEARD</p><h1>关于研究院</h1><span>一张长期积累研究与信用的数字名片。</span></header>
    <section className="about-intro"><div className="about-big">白<br />胡<br />子</div><div><h2>为股民把复杂产业研究清楚</h2><p>白胡子研究院面向个人投资者，长期研究 AI 算力与硬件、具身智能和物理 AI。每个主题都要继续落到产业链位置、相关上市公司、业绩传导、催化窗口、风险和跟踪指标。</p><p>“白胡子盐话”是研究院的内容栏目：用普通投资者听得懂的语言解释研究，但不把观点包装成事实，不把产业空间直接等同于上市公司的订单、收入或利润。</p></div></section>
    <section className="about-values"><div><b>01</b><h3>事实优先</h3><p>重要事实保留来源与日期，判断、推测和信息缺口清楚标注。</p></div><div><b>02</b><h3>持续验证</h3><p>跟踪真正会改变判断的订单、产能、财务与产业数据。</p></div><div><b>03</b><h3>欢迎证伪</h3><p>每个核心判断都写出反方观点、风险和可观察的证伪条件。</p></div></section>
    <section className="about-cta"><p>不提供简单答案，提供可复查的股票研究过程。</p><Link className="primary-button button-dark" href="/weekly">从本周开始 <span>→</span></Link></section>
  </main><SiteFooter /></>;
}
