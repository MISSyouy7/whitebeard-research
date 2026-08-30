import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { ResearchLibrary } from "@/app/research/ResearchLibrary";
import { getMainlines, getPublicResearchCards, getResearchStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "免费研究库",
  description: "路见资本公开公司、产业和研究方法，历史研究永久免费阅读与下载。",
};

export default function ResearchPage() {
  const entries = getPublicResearchCards();
  const stats = getResearchStats();
  const mainlines = getMainlines();
  return <><SiteHeader /><main className="research-page section-shell">
    <header className="research-masthead"><p>LUJIAN OPEN RESEARCH</p><h1>路见资本<br />免费研究库</h1><span>历史研究永久免费。真正收费的是持续跟踪、结构化记录和研究效率。</span><div><b>{stats.companies}</b><small>已纳入跟踪公司</small><b>{stats.industries}</b><small>已覆盖产业方向</small><b>{stats.reports}</b><small>完整公开研究</small></div></header>
    <section className="research-library"><ResearchLibrary entries={entries} /></section>
    {mainlines.length > 0 ? <section className="industry-entry"><div><span>INDUSTRY LAYERS</span><h2>从报告向产业延伸</h2><p>先做普通层级页面，保留产业、环节、公司和证据之间的关系，不急着做复杂图谱。</p></div><div>{mainlines.map((item) => <Link href={`/industry/${item.slug}`} key={item.slug}><small>{item.currentStage}</small><strong>{item.industry}</strong><span>{item.companyMappings.length}家公司进入跟踪</span></Link>)}</div></section> : null}
    <section className="research-pro-bridge"><span>CONTINUOUS RESEARCH</span><h2>报告免费，持续维护需要另一套系统。</h2><p>如果你更关心公司变化、产业链更新和核心假设是否强化，可以先告诉我们你最需要什么。</p><Link className="capital-primary" href="/pro">了解路见Pro内测 <b>→</b></Link></section>
  </main><SiteFooter /></>;
}
