import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getCapitalFlow, getCapitalFlows, markdownToHtml } from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getCapitalFlows().map((record) => ({ slug: record.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const record = getCapitalFlow((await params).slug);
  return record ? { title: record.title, description: record.summary } : {};
}

export default async function CapitalFlowDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const record = getCapitalFlow((await params).slug);
  if (!record) notFound();
  return (
    <>
      <SiteHeader />
      <main className="record-detail">
        <header className="record-hero section-shell">
          <Link href="/capital-flow">← 返回资金迁徙</Link>
          <div className="record-hero-grid">
            <div><p>CAPITAL FLOW / {formatDate(record.date)}</p><h1>{record.title}</h1><span>{record.summary}</span></div>
            <aside><small>数据截至</small><strong>{record.dataCutoff}</strong><small>核心行业</small><strong>{record.coreIndustry}</strong><small>连续性</small><strong>{record.continuity}</strong></aside>
          </div>
        </header>
        <section className="direction-detail section-shell">
          <div><header><span>INFLOW</span><h2>资金流入</h2></header>{record.inflows.map((item, index) => <article key={item.name}><b>0{index + 1}</b><div><h3>{item.name}</h3><p>{item.reason}</p><small>{item.evidence}</small></div></article>)}</div>
          <div><header><span>OUTFLOW</span><h2>资金流出</h2></header>{record.outflows.map((item, index) => <article key={item.name}><b>0{index + 1}</b><div><h3>{item.name}</h3><p>{item.reason}</p><small>{item.evidence}</small></div></article>)}</div>
        </section>
        <section className="evidence-grid section-shell">
          <article><span>背后逻辑</span><p>{record.logic}</p></article>
          <article><span>来源与口径差异</span><p>{record.methodology}</p></article>
          <article><span>反方证据</span><p>{record.counterEvidence}</p></article>
        </section>
        {record.content && <article className="markdown-body record-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(record.content) }} />}
        <section className="source-risk section-shell">
          <div><span>来源</span><ul>{record.sources.map((source) => <li key={source}>{source}</li>)}</ul></div>
          <div><span>风险提示</span><ul>{record.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul><p>仅作研究交流，不构成投资建议。</p></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
