import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getLatestCapitalFlow, getLatestQuarterlyReport, getPublicResearch, getResearchStats } from "@/lib/content";
import { membershipOffer } from "@/lib/membership";

const rhythm = [
  { index: "01", cadence: "交易日收盘", title: "90行业资金清单", copy: "记录前三进攻、主要撤退与连续性变化。" },
  { index: "02", cadence: "每周六", title: "一周资金战场", copy: "把五个快照连起来，区分进攻、回流和脉冲。" },
  { index: "03", cadence: "每季度", title: "季度资金迁徙报告", copy: "复盘全市场，并深挖2—3条核心产业线。" },
] as const;

export default function Home() {
  const flow = getLatestCapitalFlow();
  const quarterly = getLatestQuarterlyReport();
  const researchStats = getResearchStats();
  const latestResearch = getPublicResearch().slice(0, 3);

  return <><SiteHeader /><main>
    <section className="capital-hero conversion-hero">
      <div className="capital-hero-map" aria-hidden="true"><span className="map-orbit map-orbit-one" /><span className="map-orbit map-orbit-two" /><span className="map-path map-path-one" /><span className="map-path map-path-two" /><i className="map-node map-node-one" /><i className="map-node map-node-two" /><i className="map-node map-node-three" /></div>
      <div className="capital-hero-inner section-shell">
        <div className="capital-hero-copy">
          <p className="capital-eyebrow">路见资本 · 每日追踪中国资本市场的资金迁徙</p>
          <h1>资金战场</h1>
          <p className="capital-lead">今天的钱在离开什么？<br />正在聚集到哪里？<br />哪些只是脉冲，哪些已经连续增强？</p>
          <p className="capital-intro">只记录资金方向、连续性和证据变化，不预测涨跌。先免费领取本周90行业清单，再决定是否订阅一整年的持续跟踪。</p>
          <div className="capital-actions"><Link className="capital-primary" href="/qingdan">领取本周90行业清单 <span>↗</span></Link><Link className="capital-secondary" href="/join">查看{membershipOffer.priceYuan}元年度订阅</Link></div>
        </div>
        {flow ? <aside className="capital-signal-panel" aria-label="最近公开资金记录">
          <div className="signal-panel-head"><span>最近公开资金记录</span><b>{formatDate(flow.date)} / {flow.dataCutoff.slice(-5)}</b></div>
          <div className="signal-core"><small>核心方向</small><strong>{flow.coreIndustry}</strong><p>{flow.continuity}</p></div>
          <div className="signal-grid"><div><small>资金聚集</small><b>{flow.inflows[0]?.name}</b><span>{flow.inflows[0]?.evidence}</span></div><div><small>资金离开</small><b>{flow.outflows[0]?.name}</b><span>{flow.outflows[0]?.evidence}</span></div></div>
          <p className="signal-note">最近一条已核验并公开的记录，不代表实时行情或买卖建议。</p>
        </aside> : <aside className="capital-signal-panel signal-empty"><span>WAITING FOR VERIFIED DATA</span><strong>等待核验记录</strong><p>没有正式数据时，首页不会补造实时行情。</p></aside>}
      </div>
    </section>

    <section className="conversion-section section-shell">
      <div className="section-heading compact-heading"><div><span className="section-index">01</span><p>一张清单，先看懂一周<br /><small>FREE WEEKLY LIST</small></p></div><Link href="/qingdan">免费领取 ↗</Link></div>
      <div className="lead-offer-grid"><div><span>08.24—08.28</span><h2>594亿进攻，<br />为什么只持续了一天？</h2><p>免费版公开三条核心发现、资金图和研究目录。添加微信并发送“清单”，领取完整90行业PDF。</p><Link className="capital-primary" href="/qingdan">查看本周清单 <span>↗</span></Link></div><div className="lead-signal-list"><article><small>连续主攻</small><strong>软件开发</strong><p>连续4个交易日流入</p></article><article><small>后半周回流</small><strong>农业链</strong><p>后三日合计 +56.58亿</p></article><article><small>持续撤退</small><strong>医药生物</strong><p>全周 -221.15亿</p></article></div></div>
    </section>

    <section className="home-research section-shell">
      <div className="section-heading compact-heading"><div><span className="section-index">02</span><p>免费研究库<br /><small>OPEN RESEARCH LIBRARY</small></p></div><Link href="/research">进入研究库 ↗</Link></div>
      <div className="home-research-intro"><div><h2>先完整给出历史研究，<br />再判断是否需要持续跟踪。</h2><p>公司、产业与研究方法完整公开，不强制注册。收费的是持续更新、历史记录和研究效率。</p><Link className="capital-primary" href="/research">查看最新研究 <b>→</b></Link></div><div className="research-stats"><article><strong>{researchStats.companies}</strong><span>已纳入跟踪公司</span></article><article><strong>{researchStats.industries}</strong><span>已覆盖产业方向</span></article><article><strong>{researchStats.reports}</strong><span>完整公开研究</span></article></div></div>
      <div className="home-research-list">{latestResearch.map((article) => <Link href={`/articles/${article.slug}`} key={article.slug}><small>{article.category} · {article.updatedAt.replaceAll("-", ".")}</small><h3>{article.title}</h3><span>{article.pdfFile ? "全文＋免费下载PDF" : "完整公开阅读"} <b>→</b></span></Link>)}</div>
    </section>

    <section className="delivery-system">
      <div className="section-shell"><div className="section-heading compact-heading light-heading"><div><span className="section-index">03</span><p>不是一份PDF，是持续更新<br /><small>DAILY · WEEKLY · QUARTERLY</small></p></div><Link href="/join">订阅说明 ↗</Link></div><div className="delivery-rhythm">{rhythm.map((item) => <article key={item.index}><span>{item.index}</span><small>{item.cadence}</small><h2>{item.title}</h2><p>{item.copy}</p></article>)}</div></div>
    </section>

    <section className="quarter-preview section-shell">
      <div className="section-heading compact-heading"><div><span className="section-index">04</span><p>季度资金迁徙报告<br /><small>QUARTERLY CAPITAL MIGRATION</small></p></div><Link href="/quarterly">报告档案 ↗</Link></div>
      <div className="quarter-preview-grid"><div className="quarter-cover"><span>{quarterly?.quarter ?? "2026 Q3"}</span><strong>资金迁徙<br />季度报告</strong><small>路见资本 · 广路</small></div><div><p className="quarter-state">{quarterly?.status === "upcoming" ? "即将交付" : "已发布"}</p><h2>{quarterly?.title ?? "路见资本｜2026年第三季度资金迁徙报告"}</h2><p>{quarterly?.summary ?? "季度结束后，复盘全市场资金环境、90行业矩阵与2—3条核心产业线。"}</p><ul>{(quarterly?.outline ?? ["全市场资金环境与90行业矩阵", "持续进攻、阶段回流与持续撤退", "核心产业链的订单、利润与现金流验证"]).slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul><Link className="outline-button" href="/quarterly">查看季度报告计划 <span>→</span></Link></div></div>
    </section>

    <section className="method-section"><div className="section-shell method-grid"><div><span>05 / RESEARCH METHOD</span><h2>结论可以变化，<br />证据必须留下。</h2></div><div><p><b>事实</b>日期、来源、口径先核验。</p><p><b>判断</b>写清依据与保留条件。</p><p><b>修正</b>保留原判断和变化原因。</p><p><b>边界</b>只追踪资金，不预测涨跌。</p></div></div></section>

    <section className="membership-band"><div className="section-shell membership-band-grid"><div><span>ANNUAL MEMBERSHIP</span><h2>{membershipOffer.priceYuan}元一年，<br />订阅一套能回头验证的资金记录。</h2><p>交易日收盘、每周复盘、季度报告，全部由知识星球管理订阅和权限。</p></div><div className="membership-price"><small>年度订阅</small><strong><i>¥</i>{membershipOffer.priceYuan}</strong><span>知识星球承载</span><a href={membershipOffer.groupUrl} target="_blank" rel="noreferrer">进入知识星球 <b>↗</b></a></div></div></section>
  </main><SiteFooter /></>;
}
