import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { IntentReveal } from "@/app/components/IntentReveal";
import { freeListOffer } from "@/lib/membership";
import { getMainline, getMainlines } from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return getMainlines().map((item) => ({ slug: item.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const item = getMainline(slug); return item ? { title: `${item.industry}产业研究`, description: item.summary } : {};
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = getMainline(slug); if (!item) notFound();
  return <><SiteHeader /><main className="industry-page section-shell">
    <header><Link href="/research">← 返回免费研究库</Link><p>INDUSTRY RESEARCH</p><h1>{item.industry}</h1><span>{item.summary}</span></header>
    <section className="industry-facts"><article><small>当前阶段</small><h2>{item.currentStage}</h2><p>{item.stageBasis}</p></article><article><small>资金行为</small><h2>正在验证</h2><p>{item.capitalBehavior}</p></article></section>
    <section className="industry-companies"><div><span>相关公司</span><h2>先记录角色，<br />再等待证据升级。</h2></div><div>{item.companyMappings.map((company) => <article key={company.name}><h3>{company.name}</h3><p>{company.role}</p><small>{company.evidenceStatus}</small></article>)}</div></section>
    <section className="industry-track"><h2>持续跟踪这个产业</h2><p>跟踪公告、财报、产业趋势和核心假设变化，不代表跟踪买卖操作。</p><IntentReveal buttonLabel="持续跟踪这个产业" intentCode={`跟踪｜${item.industry}`} qrImage={freeListOffer.qrImage} context={`industry:${item.slug}`} description="添加后发送上方口令，我们只记录研究对象的信息和基本面变化。" /></section>
  </main><SiteFooter /></>;
}
