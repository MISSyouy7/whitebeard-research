import Link from "next/link";
import { ArticleCard } from "@/app/components/ArticleCard";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { categories, formatDate, getAllArticles, getLatestWeeklyBrief } from "@/lib/content";

const rhythm = [
  ["周一", "提出问题"],
  ["周四", "发布研究"],
  ["周日", "复盘变化"],
];

export default function Home() {
  const articles = getAllArticles();
  const weekly = getLatestWeeklyBrief();
  const latest = articles.slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-hero section-shell">
          <p className="home-kicker">白胡子研究院 · 面向股民的 AI 产业链研究</p>
          <div className="home-hero-grid">
            <div>
              <span className="home-issue">STOCK RESEARCH / 2026</span>
              <h1>把 AI 产业变化，<br />研究成<span>可跟踪的股票线索。</span></h1>
            </div>
            <div className="home-hero-copy">
              <p>从小红书、公众号或爱股票社区来到这里，都可以在同一个地方找到完整研究、判断变化和下一步跟踪。</p>
              <p>聚焦 AI 算力与硬件、具身智能、物理 AI，持续连接产业环节、上市公司与财务验证。</p>
              <div className="home-actions">
                <Link className="primary-button" href="/weekly">查看本周跟踪 <span>→</span></Link>
                <Link className="text-link" href="/articles">浏览研究档案 ↗</Link>
              </div>
            </div>
          </div>
          <div className="research-rhythm" aria-label="每周研究节奏">
            {rhythm.map(([day, action]) => <div key={day}><b>{day}</b><span>{action}</span></div>)}
            <p>先看事实，再写判断；允许变化，保留证伪。</p>
          </div>
        </section>

        <section className="weekly-preview section-shell">
          <div className="section-heading compact-heading">
            <div><span className="section-index">01</span><p>本周与你一起研究<br /><small>THIS WEEK</small></p></div>
            <Link href="/weekly">查看完整进度 ↗</Link>
          </div>
          {weekly ? (
            <article className="weekly-card">
              <div className="weekly-card-meta">
                <span>W{weekly.issue}</span>
                <strong><i />{weekly.state}</strong>
                <small>{formatDate(weekly.startDate)}—{formatDate(weekly.endDate).slice(5)}</small>
              </div>
              <div className="weekly-card-main">
                <p>本周核心问题</p>
                <h2>{weekly.title}</h2>
                <div className="weekly-card-bottom">
                  <p>{weekly.description}</p>
                  <Link className="outline-button" href="/weekly">进入本周 <span>→</span></Link>
                </div>
              </div>
              <div className="weekly-focus">
                <span>覆盖方向</span>
                {weekly.focus.map((item, index) => <div key={item}><b>0{index + 1}</b>{item}</div>)}
              </div>
            </article>
          ) : (
            <div className="empty-state"><span>WEEKLY RESEARCH</span><h2>本周研究问题正在整理</h2><p>不为了更新而制造结论，确认问题后再开始跟踪。</p></div>
          )}
        </section>

        <section className="home-research section-shell">
          <div className="section-heading compact-heading">
            <div><span className="section-index">02</span><p>最新研究<br /><small>RESEARCH ARCHIVE</small></p></div>
            <Link href="/articles">全部研究 ↗</Link>
          </div>
          {latest.length > 0 ? (
            <div className="article-list">{latest.map((article, index) => <ArticleCard article={article} index={index + 1} key={article.slug} />)}</div>
          ) : (
            <div className="research-empty">
              <div><span>0</span><small>篇正式研究</small></div>
              <div><h2>这里宁可暂时空着，<br />也不放未经核验的“示例结论”。</h2><p>首批文章会明确区分事实、判断和推测，并保留来源、反方观点与证伪条件。</p></div>
            </div>
          )}
        </section>

        <section className="fields-section">
          <div className="section-shell">
            <div className="section-heading compact-heading light-heading">
              <div><span className="section-index">03</span><p>股票研究地图<br /><small>RESEARCH MAP</small></p></div>
              <span className="heading-note">产业变化最终要接受公司经营数据验证</span>
            </div>
            <div className="field-list">
              {categories.map((category) => {
                const count = articles.filter((article) => article.categorySlug === category.slug).length;
                return <Link href={`/categories/${category.slug}`} key={category.slug}>
                  <span>{category.index}</span><h3>{category.name}</h3><p>{category.description}</p><small>{count} 篇 ↗</small>
                </Link>;
              })}
            </div>
          </div>
        </section>

        <section className="join-band section-shell">
          <span className="join-band-label">STAY CONNECTED</span>
          <div><h2>平台会变，<br />这张名片一直在。</h2><p>收藏永久域名，跟着每周研究节奏阅读；想加入候补名单，可以从你来的平台私信关键词。</p></div>
          <Link className="primary-button button-dark" href="/join">加入研究院 <span>→</span></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
