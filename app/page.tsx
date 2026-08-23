/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArticleCard } from "@/app/components/ArticleCard";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import {
  formatDate,
  getAllArticles,
  getHerPerspectiveEntries,
  getLatestBoard,
  getLatestCapitalFlow,
  getMainlines,
  mainlineStages,
} from "@/lib/content";

export default function Home() {
  const flow = getLatestCapitalFlow();
  const mainlines = getMainlines();
  const board = getLatestBoard();
  const articles = getAllArticles().slice(0, 4);
  const perspectives = getHerPerspectiveEntries().slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="capital-hero">
          <div className="capital-hero-map" aria-hidden="true">
            <span className="map-orbit map-orbit-one" />
            <span className="map-orbit map-orbit-two" />
            <span className="map-path map-path-one" />
            <span className="map-path map-path-two" />
            <i className="map-node map-node-one" />
            <i className="map-node map-node-two" />
            <i className="map-node map-node-three" />
          </div>
          <div className="capital-hero-inner section-shell">
            <div className="capital-hero-copy">
              <p className="capital-eyebrow">LUJIAN CAPITAL · CAPITAL OBSERVATION SYSTEM</p>
              <h1>路见资本</h1>
              <p className="capital-lead">看见资本流向，<br />理解产业未来。</p>
              <p className="capital-intro">追踪资金迁徙、产业周期与市场情绪，用可复查的事实和持续更新的证据，建立自己的资本观察坐标。</p>
              <div className="capital-actions">
                <Link className="capital-primary" href="/capital-flow">进入资金迁徙 <span>↗</span></Link>
                <Link className="capital-secondary" href="/articles">浏览研究文章</Link>
              </div>
            </div>
            {flow ? (
              <aside className="capital-signal-panel" aria-label="最近交易日资本迁徙">
                <div className="signal-panel-head"><span>最近交易日资本迁徙</span><b>{formatDate(flow.date)} / {flow.dataCutoff.slice(-5)}</b></div>
                <div className="signal-core"><small>核心方向</small><strong>{flow.coreIndustry}</strong><p>{flow.continuity}。{flow.inflows[0]?.reason}</p></div>
                <div className="signal-grid">
                  <div><small>流入观察</small><b>{flow.inflows[1]?.name ?? flow.inflows[0]?.name}</b><span>{flow.inflows[1]?.evidence ?? flow.continuity}</span></div>
                  <div><small>流出观察</small><b>{flow.outflows[0]?.name}</b><span>{flow.outflows[0]?.reason}</span></div>
                </div>
                <p className="signal-note">数据来自最近一条已核验、正式发布的记录，不代表实时行情或买卖建议。</p>
              </aside>
            ) : (
              <aside className="capital-signal-panel signal-empty"><span>WAITING FOR VERIFIED DATA</span><strong>等待核验记录</strong><p>没有正式数据时，首页不会补造实时行情。</p></aside>
            )}
          </div>
        </section>

        <section className="system-section section-shell">
          <div className="section-heading compact-heading">
            <div><span className="section-index">01</span><p>最近交易日资金迁徙<br /><small>LATEST CAPITAL FLOW</small></p></div>
            <Link href="/capital-flow">查看全部记录 ↗</Link>
          </div>
          {flow && (
            <article className="flow-feature">
              <div className="flow-feature-lead">
                <div className="record-time"><span>数据截至</span><b>{flow.dataCutoff}</b></div>
                <h2>{flow.title}</h2>
                <p>{flow.summary}</p>
                <Link href={`/capital-flow/${flow.slug}`}>打开完整资金地图 ↗</Link>
              </div>
              <div className="flow-directions">
                <div><span className="direction-label inflow-label">流入</span>{flow.inflows.slice(0, 3).map((item) => <div key={item.name}><b>{item.name}</b><p>{item.reason}</p></div>)}</div>
                <div><span className="direction-label outflow-label">流出</span>{flow.outflows.slice(0, 3).map((item) => <div key={item.name}><b>{item.name}</b><p>{item.reason}</p></div>)}</div>
              </div>
            </article>
          )}
        </section>

        <section className="mainline-home">
          <div className="section-shell">
            <div className="section-heading compact-heading light-heading">
              <div><span className="section-index">02</span><p>当前主线生命周期<br /><small>MAINLINE LIFECYCLE</small></p></div>
              <Link href="/mainline">进入产业地图 ↗</Link>
            </div>
            <div className="lifecycle-axis" aria-label="产业生命周期五阶段">
              {mainlineStages.map((stage) => <span key={stage}>{stage}</span>)}
            </div>
            <div className="mainline-home-grid">
              {mainlines.slice(0, 2).map((item, index) => (
                <Link href={`/mainline/${item.slug}`} key={item.slug}>
                  <div className="mainline-card-head"><span>0{index + 1}</span><b>{item.industry}</b></div>
                  <strong>{item.currentStage}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <small>查看证据与证伪条件 ↗</small>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="system-section section-shell">
          <div className="section-heading compact-heading">
            <div><span className="section-index">03</span><p>A股棋盘快照<br /><small>A-SHARE BOARD</small></p></div>
            <Link href="/board">查看完整棋盘 ↗</Link>
          </div>
          {board && (
            <div className="board-snapshot">
              <div className="board-snapshot-copy"><span>{formatDate(board.date)}</span><h2>产业阶段 × 资金强弱</h2><p>{board.summary}</p><small>研究热度是人工研究标记，不是量化预测。</small></div>
              <div className="board-piece-strip">
                {board.pieces.map((piece) => <article data-strength={piece.capitalStrength} key={piece.name}><span>{piece.capitalStrength}</span><h3>{piece.name}</h3><p>{piece.stage}</p><small>{piece.evidenceStatus}</small></article>)}
              </div>
            </div>
          )}
        </section>

        <section className="home-research section-shell">
          <div className="section-heading compact-heading">
            <div><span className="section-index">04</span><p>最新研究文章<br /><small>RESEARCH ARCHIVE</small></p></div>
            <Link href="/articles">全部研究 ↗</Link>
          </div>
          <div className="article-list">{articles.map((article, index) => <ArticleCard article={article} index={index + 1} key={article.slug} />)}</div>
        </section>

        <section className="perspective-home section-shell">
          <div className="section-heading compact-heading">
            <div><span className="section-index">05</span><p>她的资本视角<br /><small>FINANCE, RISK & LIFE</small></p></div>
            <Link href="/her-perspective">查看全部漫画 ↗</Link>
          </div>
          <div className="perspective-grid">
            {perspectives.map((entry) => (
              <Link href={`/her-perspective/${entry.slug}`} key={entry.slug}>
                <div className="perspective-cover"><img src={entry.cover} alt={`${entry.title}封面`} loading="lazy" decoding="async" /></div>
                <div className="perspective-card-copy"><span>ISSUE {entry.issue} · {formatDate(entry.date)}</span><h3>{entry.title.replace(/^\d+｜/, "")}</h3><p>{entry.summary}</p></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="principles-band">
          <div className="section-shell principles-band-grid">
            <div><span>06 / RESEARCH PRINCIPLES</span><h2>结论可以变化，<br />证据必须留下。</h2></div>
            <div className="principle-list"><p><b>01</b>事实、判断与推测分开</p><p><b>02</b>记录来源、日期与统计口径</p><p><b>03</b>保留反方观点与证伪条件</p><p><b>04</b>不提供喊单、收益承诺或持仓复制</p></div>
            <Link className="capital-primary" href="/about">关于路见资本 <span>↗</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
