import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/app/components/ArticleCard";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getAllArticles, getArticle, markdownToHtml } from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const params = getAllArticles().map((article) => ({ slug: article.slug }));
  return params.length > 0 ? params : [{ slug: "__no-published-articles__" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return article ? { title: article.title, description: article.description } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const isZsxq = article.access === "zsxq";
  const related = getAllArticles().filter((item) => item.slug !== article.slug && item.categorySlug === article.categorySlug).slice(0, 2);

  return (
    <><SiteHeader /><main className="article-page">
      <header className="article-hero section-shell">
        <Link className="back-link" href={`/categories/${article.categorySlug}`}>← 返回{article.category}</Link>
        <div className="article-hero-grid">
          <div className={`issue-mark${isZsxq ? " issue-mark-zsxq" : ""}`}><span>{isZsxq ? "MEMBER" : "PUBLIC"}</span><strong>{isZsxq ? "星球" : "公开"}</strong><small>WHITEBEARD<br />RESEARCH</small></div>
          <div>
            <div className="article-meta"><Link href={`/categories/${article.categorySlug}`}>{article.category}</Link><span>{formatDate(article.date)}</span><span>主理人 · 广路</span><span className={`access-badge access-${article.access}`}>{isZsxq ? "星球专享" : "公开全文"}</span></div>
            <h1>{article.title}</h1>
            <p>{article.description}</p>
          </div>
        </div>
      </header>
      {isZsxq ? (
        <div className="preview-layout section-shell">
          <section className="preview-points">
            <span>这篇研究包含</span>
            <ol>{article.keyPoints.map((point, index) => <li key={point}><b>0{index + 1}</b><p>{point}</p></li>)}</ol>
          </section>
          <aside className="member-gate">
            <span>MEMBER RESEARCH</span>
            <h2>完整研究在知识星球</h2>
            <p>官网只保留公开摘要和研究要点，付费正文不存放在公开网站。已订阅读者可直接进入原文，未订阅读者由知识星球展示加入方式。</p>
            <a className="primary-button" href={article.zsxqUrl} target="_blank" rel="noreferrer">去知识星球阅读全文 <span>↗</span></a>
            <small>仅作研究交流，不构成投资建议。市场数据与判断会随时间变化，请以最新公开资料为准。</small>
          </aside>
        </div>
      ) : (
        <div className="article-layout section-shell">
          <aside className="article-aside"><span>研究备忘</span><p>事实是起点<br />框架是地图<br />结论只是暂时的坐标</p><div>主理人 / 广路</div></aside>
          <article className="markdown-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }} />
        </div>
      )}
      {related.length > 0 && <section className="related section-shell"><div className="section-heading"><div><span className="section-index">MORE</span><p>延伸阅读<br /><small>RELATED RESEARCH</small></p></div></div><div className="article-list">{related.map((item, index) => <ArticleCard article={item} index={index + 1} compact key={item.slug} />)}</div></section>}
    </main><SiteFooter /></>
  );
}
