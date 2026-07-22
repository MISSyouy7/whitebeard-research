import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/app/components/ArticleCard";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { categories, getArticlesByCategory } from "@/lib/content";

export function generateStaticParams() { return categories.map((category) => ({ category: category.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const articles = getArticlesByCategory(category.slug);

  return (
    <><SiteHeader /><main className="archive-page section-shell">
      <header className="page-masthead category-masthead"><p>FIELD / {category.index}</p><h1>{category.name}</h1><span>{category.description}</span></header>
      <nav className="category-tabs" aria-label="研究分类"><Link href="/articles">全部</Link>{categories.map((item) => <Link className={item.slug === category.slug ? "active" : ""} href={`/categories/${item.slug}`} key={item.slug}>{item.name}</Link>)}</nav>
      <div className="archive-summary"><span>{category.name} · {articles.length} 篇</span><span>持续更新中</span></div>
      <div className="article-list archive-list">{articles.map((article, index) => <ArticleCard article={article} index={index + 1} key={article.slug} />)}</div>
    </main><SiteFooter /></>
  );
}
