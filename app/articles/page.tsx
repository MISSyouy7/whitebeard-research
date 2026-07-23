import type { Metadata } from "next";
import { ArticleCard } from "@/app/components/ArticleCard";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { categories, getAllArticles } from "@/lib/content";
import Link from "next/link";

export const metadata: Metadata = { title: "研究档案", description: "浏览白胡子研究院全部公开研究。" };

export default function ArticlesPage() {
  const articles = getAllArticles();
  return (
    <><SiteHeader /><main className="archive-page section-shell">
      <header className="page-masthead"><p>RESEARCH ARCHIVE / {String(articles.length).padStart(3, "0")}</p><h1>研究档案</h1><span>把问题留下，把答案交给时间。</span></header>
      <nav className="category-tabs" aria-label="研究分类">
        <Link className="active" href="/articles">全部</Link>
        {categories.map((category) => <Link href={`/categories/${category.slug}`} key={category.slug}>{category.name}</Link>)}
      </nav>
      <div className="archive-summary"><span>共收录 {articles.length} 篇</span><span>按发布日期排序 ↓</span></div>
      {articles.length > 0 ? <div className="article-list archive-list">{articles.map((article, index) => <ArticleCard article={article} index={index + 1} key={article.slug} />)}</div> : <div className="empty-state archive-empty"><span>RESEARCH IN PROGRESS</span><h2>公开研究即将开始</h2><p>示例内容已与正式档案隔离。首批文章通过事实核验与证伪检查后将在这里发布。</p></div>}
    </main><SiteFooter /></>
  );
}
