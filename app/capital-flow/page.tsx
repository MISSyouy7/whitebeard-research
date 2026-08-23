import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getCapitalFlows } from "@/lib/content";

export const metadata: Metadata = {
  title: "资金迁徙",
  description: "按交易日记录A股资金流入、流出、连续性、统计口径、反方证据与风险。",
};

export default function CapitalFlowPage() {
  const records = getCapitalFlows();
  return (
    <>
      <SiteHeader />
      <main className="system-page flow-page section-shell">
        <header className="system-masthead">
          <div><p>CAPITAL FLOW / {String(records.length).padStart(3, "0")}</p><h1>资金迁徙</h1></div>
          <div><strong>资金从哪里来，<br />又去了哪里。</strong><p>不自动抓取、不预测涨跌。每一条记录都由人工核验后发布，并保留来源、口径差异与反方证据。</p></div>
        </header>
        <section className="flow-record-list">
          {records.map((record, index) => (
            <article key={record.slug}>
              <div className="flow-record-index"><b>{String(index + 1).padStart(2, "0")}</b><span>{formatDate(record.date)}</span><small>截至 {record.dataCutoff.slice(-5)}</small></div>
              <div className="flow-record-main"><span>{record.continuity}</span><h2><Link href={`/capital-flow/${record.slug}`}>{record.title}</Link></h2><p>{record.summary}</p><Link href={`/capital-flow/${record.slug}`}>查看完整证据 ↗</Link></div>
              <div className="flow-record-map">
                <div><span>流入</span>{record.inflows.slice(0, 3).map((item) => <b key={item.name}>{item.name}</b>)}</div>
                <div><span>流出</span>{record.outflows.slice(0, 3).map((item) => <b key={item.name}>{item.name}</b>)}</div>
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
