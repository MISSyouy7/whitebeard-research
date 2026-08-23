import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getMainline, getMainlines, mainlineStages, markdownToHtml } from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getMainlines().map((record) => ({ slug: record.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const record = getMainline((await params).slug);
  return record ? { title: record.title, description: record.summary } : {};
}

function BulletGroup({ title, items }: { title: string; items: string[] }) {
  return <article><span>{title}</span><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
}

export default async function MainlineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const record = getMainline((await params).slug);
  if (!record) notFound();
  const stageIndex = mainlineStages.indexOf(record.currentStage);
  return (
    <>
      <SiteHeader />
      <main className="record-detail mainline-detail">
        <header className="record-hero section-shell">
          <Link href="/mainline">← 返回主线生命</Link>
          <div className="record-hero-grid">
            <div><p>{record.industry} / {formatDate(record.date)}</p><h1>{record.title}</h1><span>{record.summary}</span></div>
            <aside><small>当前阶段</small><strong>{record.currentStage}</strong><small>研究状态</small><strong>持续验证</strong></aside>
          </div>
        </header>
        <section className="detail-lifecycle section-shell">
          {mainlineStages.map((stage, index) => <div className={index === stageIndex ? "active" : index < stageIndex ? "passed" : ""} key={stage}><b>0{index + 1}</b><i /><span>{stage}</span></div>)}
        </section>
        <section className="stage-basis section-shell"><span>阶段判断依据</span><p>{record.stageBasis}</p></section>
        <section className="mainline-facts section-shell">
          <BulletGroup title="产业特点" items={record.industryTraits} />
          <BulletGroup title="代表环节" items={record.representativeLinks} />
          <article><span>资金行为</span><p>{record.capitalBehavior}</p></article>
        </section>
        <section className="company-mapping section-shell">
          <header><span>上市公司映射</span><p>公司名称只用于产业链研究定位，不代表确定受益或买卖建议。</p></header>
          <div>{record.companyMappings.map((company) => <article key={company.name}><h3>{company.name}</h3><p>{company.role}</p><small>{company.evidenceStatus}</small></article>)}</div>
        </section>
        <section className="mainline-facts mainline-proof section-shell">
          <BulletGroup title="催化窗口" items={record.catalysts} />
          <BulletGroup title="风险" items={record.risks} />
          <BulletGroup title="证伪条件" items={record.falsification} />
          <BulletGroup title="下一步跟踪指标" items={record.trackingIndicators} />
        </section>
        {record.content && <article className="markdown-body record-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(record.content) }} />}
        <section className="source-risk section-shell"><div><span>来源</span><ul>{record.sources.map((source) => <li key={source}>{source}</li>)}</ul></div><div><span>研究边界</span><p>产业阶段会随新证据变化。送样、认证、定点、订单、收入与现金流必须分级记录。</p><p>仅作研究交流，不构成投资建议。</p></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
