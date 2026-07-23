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
          <div className="hero-kicker"><span>AI INDUSTRY RESEARCH / LONG-TERM RECORD</span><span>白胡子盐话</span></div>
          <div className="hero-grid">
            <div className="hero-title-wrap">
              <p className="hero-eyebrow">WHITEBEARD<br />RESEARCH INSTITUTE</p>
              <h1><span>白胡子</span><br />研究院</h1>
              <div className="hero-stamp" aria-hidden="true">研究<br />求真</div>
            </div>
            <div className="hero-intro">
              <p className="hero-lead">看懂 AI 产业链，<br />跟踪真实变化。</p>
              <p>面向个人投资者，聚焦 AI 算力与硬件、具身智能与物理 AI。从技术、产业到公司，建立可以持续验证的研究框架。</p>
              <Link className="primary-button" href="/articles">进入研究档案 <span>→</span></Link>
            </div>
          </div>
          <div className="hero-ticker" aria-label="研究原则">
            <span>NO. 001</span><strong>不追逐概念，验证产业。</strong><span>FACTS · EVIDENCE · FALSIFICATION</span>
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
          {latest.length > 0 ? (
            <>
              <div className="article-list">
                {latest.map((article, index) => <ArticleCard article={article} index={index + 1} key={article.slug} />)}
              </div>
              <div className="center-action"><Link className="outline-button" href="/articles">浏览全部研究 <span>→</span></Link></div>
            </>
          ) : (
            <div className="empty-state">
              <span>RESEARCH IN PROGRESS</span>
              <h2>首批正式研究正在准备中</h2>
              <p>只有完成来源核验、反方观点和证伪条件检查的文章，才会进入公开档案。</p>
            </div>
          )}
        </section>

        <section className="category-section">
          <div className="section-shell">
            <div className="section-heading light-heading">
              <div><span className="section-index">03</span><p>研究领域<br /><small>OUR FIELDS</small></p></div>
              <span className="heading-note">五个入口，一套可验证的方法</span>
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
            <div><b>02</b><h3>跟踪验证</h3><p>把叙事还原为订单、产能、财务和可持续更新的数据。</p></div>
            <div><b>03</b><h3>主动证伪</h3><p>写下反方观点和失效条件，也允许自己修正判断。</p></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
