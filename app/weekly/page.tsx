import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getWeeklyBriefs, markdownToHtml } from "@/lib/content";

export const metadata: Metadata = {
  title: "本周研究跟踪",
  description: "白胡子研究院每周股票研究问题、研究进度、判断变化与下一步跟踪。",
};

export default function WeeklyPage() {
  const briefs = getWeeklyBriefs();
  const current = briefs[0];

  return <><SiteHeader /><main className="weekly-page section-shell">
    <header className="page-masthead weekly-masthead"><p>THIS WEEK / STOCK RESEARCH</p><h1>本周</h1><span>陪你把一个问题研究到底，而不是每天换一个热点。</span></header>
    {current ? <>
      <section className="weekly-head">
        <div className="weekly-number"><small>WEEK</small><strong>{current.issue}</strong><span>{current.state}</span></div>
        <div><p>{formatDate(current.startDate)}—{formatDate(current.endDate).slice(5)}</p><h2>{current.title}</h2><span>{current.description}</span></div>
      </section>
      <section className="weekly-signals" aria-label="本周研究说明">
        <div><small>01 / 当前状态</small><strong>{current.state}</strong><p>结论不足时只更新进度，不强行发布观点。</p></div>
        <div><small>02 / 覆盖方向</small><strong>{current.focus.join(" · ")}</strong><p>所有主题最终都要回到产业环节、上市公司和经营数据。</p></div>
        <div><small>03 / 更新原则</small><strong>证据优先</strong><p>保留来源、反方观点、证伪条件与判断变化。</p></div>
      </section>
      <article className="weekly-body markdown-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(current.content) }} />
      {briefs.length > 1 && <section className="weekly-history"><h2>往期跟踪</h2>{briefs.slice(1).map((brief) => <article key={brief.slug}><span>W{brief.issue}</span><div><h3>{brief.title}</h3><p>{formatDate(brief.startDate)}—{formatDate(brief.endDate).slice(5)}</p></div></article>)}</section>}
    </> : <div className="empty-state"><span>WEEKLY RESEARCH</span><h2>本周研究问题正在整理</h2><p>研究开始后，这里会持续记录问题、证据和判断变化。</p></div>}
    <section className="weekly-cta"><p>想长期跟踪，而不是只看一条结论？</p><Link className="primary-button button-dark" href="/join">查看加入方式 <span>→</span></Link></section>
  </main><SiteFooter /></>;
}
