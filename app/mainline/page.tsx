import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getMainlines, mainlineStages } from "@/lib/content";

export const metadata: Metadata = {
  title: "主线生命",
  description: "用五阶段产业生命周期记录主线位置、证据、资金行为、风险和证伪条件。",
};

export default function MainlinePage() {
  const records = getMainlines();
  return (
    <>
      <SiteHeader />
      <main className="system-page mainline-page">
        <header className="system-masthead section-shell">
          <div><p>MAINLINE LIFECYCLE / {String(records.length).padStart(3, "0")}</p><h1>主线生命</h1></div>
          <div><strong>产业会生长，<br />也会重构。</strong><p>生命周期只是研究坐标，不是行业涨跌预测。每个阶段都要接受订单、收入、毛利和现金流验证。</p></div>
        </header>
        <section className="lifecycle-map-band">
          <div className="section-shell lifecycle-map">
            {mainlineStages.map((stage, index) => <div key={stage}><b>0{index + 1}</b><span>{stage}</span></div>)}
          </div>
        </section>
        <section className="mainline-list section-shell">
          {records.map((record, index) => {
            const activeIndex = mainlineStages.indexOf(record.currentStage);
            return (
              <article key={record.slug}>
                <div className="mainline-list-index"><b>{String(index + 1).padStart(2, "0")}</b><span>{formatDate(record.date)}</span></div>
                <div className="mainline-list-main"><span>{record.industry}</span><h2><Link href={`/mainline/${record.slug}`}>{record.title}</Link></h2><p>{record.summary}</p><Link href={`/mainline/${record.slug}`}>查看产业证据地图 ↗</Link></div>
                <div className="mini-lifecycle" aria-label={`当前阶段：${record.currentStage}`}>{mainlineStages.map((stage, stageIndex) => <div className={stageIndex === activeIndex ? "active" : stageIndex < activeIndex ? "passed" : ""} key={stage}><i /><span>{stage}</span></div>)}</div>
              </article>
            );
          })}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
