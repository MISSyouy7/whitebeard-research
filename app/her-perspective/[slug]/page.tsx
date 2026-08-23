import type { Metadata } from "next";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getHerPerspectiveEntries, getHerPerspectiveEntry } from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getHerPerspectiveEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = getHerPerspectiveEntry((await params).slug);
  if (!entry) return {};
  const assetBase = process.env.PAGES_BASE_PATH ?? "";
  return {
    title: entry.title,
    description: `${entry.summary} 她的资本视角以小泡沫观察财务自主、市场认知与风险。`,
    keywords: ["女性财经", "财务自主", "市场认知", "风险", "财经漫画"],
    openGraph: {
      type: "article",
      title: `${entry.title}｜她的资本视角`,
      description: entry.summary,
      publishedTime: entry.date,
      images: [{ url: `${assetBase}${entry.cover}`, width: 1080, height: 1920, alt: `${entry.title}漫画封面` }],
    },
  };
}

export default async function HerPerspectiveDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getHerPerspectiveEntry((await params).slug);
  if (!entry) notFound();
  return (
    <>
      <SiteHeader />
      <main className="perspective-detail">
        <header className="perspective-detail-head section-shell">
          <Link href="/her-perspective">← 返回她的资本视角</Link>
          <div><p>HER CAPITAL PERSPECTIVE / ISSUE {entry.issue}</p><h1>{entry.title.replace(/^\d+｜/, "")}</h1><span>{entry.summary}</span><small>{formatDate(entry.date)} · 广路</small></div>
        </header>
        <section className="comic-sequence section-shell" aria-label={`${entry.title}共7张漫画`}>
          {entry.images.map((src, index) => <figure key={src}><div><img src={src} alt={`${entry.title}第${index + 1}张`} width="1080" height="1920" loading={index === 0 ? "eager" : "lazy"} decoding="async" /></div><figcaption>{String(index + 1).padStart(2, "0")} / 07</figcaption></figure>)}
        </section>
        <section className="perspective-reading section-shell">
          <article><span>市场背景或现实议题</span><p>{entry.marketContext}</p></article>
          <article><span>关键数据</span><ul>{entry.keyData.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span>内容解释</span><p>{entry.explanation}</p></article>
          <article className="women-insight"><span>给女性读者的认知提示</span><p>{entry.womenInsight}</p></article>
          <article><span>来源</span><p>{entry.source}</p></article>
          <article><span>风险与免责声明</span><p>{entry.risks}</p></article>
        </section>
        {entry.videoUrl && <section className="external-video section-shell"><span>外部视频</span><a href={entry.videoUrl} target="_blank" rel="noreferrer">观看对应视频 ↗</a></section>}
      </main>
      <SiteFooter />
    </>
  );
}
