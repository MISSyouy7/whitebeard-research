import type { Metadata } from "next";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getHerPerspectiveEntries } from "@/lib/content";

export const metadata: Metadata = {
  title: "她的资本视角",
  description: "写给女性读者的财经漫画：以小泡沫观察金钱、市场、风险、财务自主和人的情绪。",
  keywords: ["女性财经", "财务自主", "市场认知", "风险承受能力", "财经漫画"],
};

export default function HerPerspectivePage() {
  const entries = getHerPerspectiveEntries();
  return (
    <>
      <SiteHeader />
      <main className="system-page perspective-page section-shell">
        <header className="system-masthead">
          <div><p>HER CAPITAL PERSPECTIVE / {String(entries.length).padStart(3, "0")}</p><h1>她的资本视角</h1></div>
          <div><strong>专业、克制，<br />也保留温度。</strong><p>写给女性读者的财经漫画栏目，以小泡沫观察金钱、市场、风险和人的情绪。不假设女性不懂金融，也不把生活选择变成道德要求。</p></div>
        </header>
        <section className="perspective-archive-grid">
          {entries.map((entry) => (
            <Link href={`/her-perspective/${entry.slug}`} key={entry.slug}>
              <div className="perspective-cover archive-cover"><img src={entry.cover} alt={`${entry.title}封面`} loading="lazy" decoding="async" /></div>
              <div className="perspective-card-copy"><span>ISSUE {entry.issue} · {formatDate(entry.date)}</span><h2>{entry.title.replace(/^\d+｜/, "")}</h2><p>{entry.summary}</p><small>阅读7格漫画与认知提示 ↗</small></div>
            </Link>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
