import Link from "next/link";
import { ArticleCard } from "@/app/components/ArticleCard";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { categories, formatDate, getAllArticles } from "@/lib/content";

export default function Home() {
  const articles = getAllArticles();
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const latest = articles.filter((article) => article.slug !== featured?.slug).slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero section-shell">
          <div className="hero-kicker"><span>独立研究 / 长期主义</span><span>EST. 2024</span></div>
          <div className="hero-grid">
            <div className="hero-title-wrap">
              <p className="hero-eyebrow">WHITEBEARD<br />RESEARCH INSTITUTE</p>
              <h1><span>白胡子</span><br />研究院</h1>
              <div className="hero-stamp" aria-hidden="true">研究<br />求真</div>
            </div>
            <div className="hero-intro">
              <p className="hero-lead">把复杂的问题，<br />研究得更清楚一点。</p>
              <p>这里不追逐每一个热点。我们关注那些真正影响长期价值的变量，并把思考过程完整地写下来。</p>
              <Link className="primary-button" href="/articles">进入研究档案 <span>→</span></Link>
            </div>
          </div>
          <div className="hero-ticker" aria-label="研究原则">
            <span>NO. 001</span><strong>不预测浪潮，理解潮汐。</strong><span>FACTS · FRAMEWORK · PATIENCE</span>
          </div>
        </section>

        {featured && (
          <section className="featured section-shell">
            <div className="section-heading">
              <div><span className="section-index">01</span><p>本期研判<br /><small>FEATURED RESEARCH</small></p></div>
              <Link href="/articles">全部研究 ↗</Link>
            </div>
            <article className="featured-card">
              <div className="featured-visual">
                <div className="visual-grid" aria-hidden="true">
                  <span className="v-line v-one" /><span className="v-line v-two" /><span className="v-line v-three" />
                  <b>THESIS<br />/{featured.issue}</b><em>趋势不是直线<br />而是多重变量的共振</em>
                </div>
              </div>
              <div className="featured-content">
                <div className="article-meta"><Link href={`/categories/${featured.categorySlug}`}>{featured.category}</Link><span>{formatDate(featured.date)}</span><span>{featured.readingTime} MIN</span></div>
                <h2><Link href={`/articles/${featured.slug}`}>{featured.title}</Link></h2>
                <p>{featured.description}</p>
                <div className="featured-points">
                  <span>研究议题</span>
                  {featured.tags.slice(0, 3).map((tag, index) => <div key={tag}><b>0{index + 1}</b>{tag}</div>)}
                </div>
                <Link className="primary-button button-dark" href={`/articles/${featured.slug}`}>阅读完整报告 <span>↗</span></Link>
              </div>
            </article>
          </section>
        )}

        <section className="latest section-shell">
          <div className="section-heading">
            <div><span className="section-index">02</span><p>最新研究<br /><small>LATEST NOTES</small></p></div>
            <span className="heading-note">每一篇都源于一个真实的问题</span>
          </div>
          <div className="article-list">
            {latest.map((article, index) => <ArticleCard article={article} index={index + 1} key={article.slug} />)}
          </div>
          <div className="center-action"><Link className="outline-button" href="/articles">浏览全部研究 <span>→</span></Link></div>
        </section>

        <section className="category-section">
          <div className="section-shell">
            <div className="section-heading light-heading">
              <div><span className="section-index">03</span><p>研究领域<br /><small>OUR FIELDS</small></p></div>
              <span className="heading-note">四个视角，一套求真的方法</span>
            </div>
            <div className="category-grid">
              {categories.map((category) => {
                const count = articles.filter((article) => article.categorySlug === category.slug).length;
                return (
                  <Link href={`/categories/${category.slug}`} className="category-card" key={category.slug}>
                    <span>{category.index}</span>
                    <div className="category-glyph" aria-hidden="true">{category.short.slice(0, 1)}</div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <small>{String(count).padStart(2, "0")} 篇研究 <b>↗</b></small>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="manifesto section-shell">
          <div className="manifesto-label">OUR WAY OF THINKING</div>
          <blockquote>“研究不是寻找一个漂亮的答案，<br />而是不断逼近<span>真实</span>。”</blockquote>
          <div className="principles">
            <div><b>01</b><h3>事实优先</h3><p>先确认我们知道什么，再讨论它意味着什么。</p></div>
            <div><b>02</b><h3>框架思考</h3><p>建立变量之间的联系，而非堆砌孤立的信息。</p></div>
            <div><b>03</b><h3>保持耐心</h3><p>允许结论晚一点出现，也允许自己修正判断。</p></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
