"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicResearchCard } from "@/lib/content";
import { trackEvent } from "@/app/components/Analytics";

type Props = { entries: PublicResearchCard[] };

export function ResearchLibrary({ entries }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const categories = useMemo(() => ["全部", ...Array.from(new Set(entries.map((entry) => entry.category)))], [entries]);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const categoryMatch = category === "全部" || entry.category === category;
      const searchText = [entry.title, entry.description, entry.companyName, entry.stockCode, entry.category, ...entry.industrySlugs, ...entry.tags].filter(Boolean).join(" ").toLowerCase();
      return categoryMatch && (!normalized || searchText.includes(normalized));
    });
  }, [entries, query, category]);

  const updateQuery = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) trackEvent("research_search", { query: value.trim() });
  };

  return <>
    <div className="research-search"><label htmlFor="research-query">搜索公司、股票代码、产业或关键词</label><input id="research-query" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="例如：物理AI、半导体、财务验证" /></div>
    <nav className="research-filters" aria-label="研究分类">{categories.map((item) => <button className={item === category ? "active" : ""} type="button" onClick={() => setCategory(item)} key={item}>{item}</button>)}</nav>
    <div className="research-result-note">找到 {results.length} 份完整公开研究</div>
    <section className="research-library-grid">{results.map((entry, index) => <article key={entry.slug}>
      <div className="research-card-index">{String(index + 1).padStart(2, "0")}</div>
      <div className="research-card-meta"><span>{entry.category}</span><span>{entry.updatedAt.replaceAll("-", ".")}</span><span>广路</span></div>
      <h2><Link href={`/articles/${entry.slug}`} onClick={() => trackEvent("report_view", { slug: entry.slug, source: "research_library" })}>{entry.title}</Link></h2>
      <p>{entry.description}</p>
      <div className="research-tags">{entry.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="research-card-actions"><Link href={`/articles/${entry.slug}`} onClick={() => trackEvent("report_view", { slug: entry.slug, source: "research_library" })}>完整阅读 <b>→</b></Link>{entry.pdfFile ? <a href={entry.pdfFile} target="_blank" rel="noreferrer" onClick={() => trackEvent("report_download", { slug: entry.slug, source: "research_library" })}>免费下载PDF <b>↓</b></a> : null}</div>
    </article>)}</section>
    {results.length === 0 ? <div className="research-empty"><h2>暂时没有匹配结果</h2><p>换一个行业、公司或研究关键词试试。</p></div> : null}
  </>;
}
