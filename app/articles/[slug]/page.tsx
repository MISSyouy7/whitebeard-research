import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/app/components/ArticleCard";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getAllArticles, getArticle, markdownToHtml } from "@/lib/content";

export function generateStaticParams() { return getAllArticles().map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return article ? { title: article.title, description: article.description } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = getAllArticles().filter((item) => item.slug !== article.slug && item.categorySlug === article.categorySlug).slice(0, 2);

  return (
    <><SiteHeader /><main className="article-page">
      <header className="article-hero section-shell">
        <Link className="back-link" href={`/categories/${article.categorySlug}`}>← 返回{article.category}</Link>
        <div className="article-hero-grid">
          <div className="issue-mark"><span>ISSUE</span><strong>{article.issue}</strong><small>WHITEBEARD<br />RESEARCH</small></div>
          <div>
            <div className="article-meta"><Link href={`/categories/${article.categorySlug}`}>{article.category}</Link><span>{formatDate(article.date)}</span><span>{article.readingTime} MIN READ</span></div>
            <h1>{article.title}</h1>
            <p>{article.description}</p>
            <div className="tag-list">{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
          </div>
        </div>
      </header>
      <div className="article-layout section-shell">
        <aside className="article-aside"><span>研究备忘</span><p>事实是起点<br />框架是地图<br />结论只是暂时的坐标</p><div>WB / {article.issue}</div></aside>
        <article className="markdown-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }} />
      </div>
      {related.length > 0 && <section className="related section-shell"><div className="section-heading"><div><span className="section-index">MORE</span><p>延伸阅读<br /><small>RELATED RESEARCH</small></p></div></div><div className="article-list">{related.map((item, index) => <ArticleCard article={item} index={index + 1} compact key={item.slug} />)}</div></section>}
    </main><SiteFooter /></>
  );
}
