/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { TrackedLink } from "@/app/components/TrackedLink";
import { membershipOffer } from "@/lib/membership";

export const metadata: Metadata = { title: "订阅资金战场｜299元一年", description: "订阅每日90行业资金清单、每周资金战场和季度资金迁徙报告。" };

export default function JoinPage() {
  return <><SiteHeader /><main className="join-page section-shell">
    <header className="subscription-hero"><p>路见资本 · 年度订阅</p><h1><span>{membershipOffer.priceYuan}元</span>一年，<br />不购买涨跌预测。</h1><h2>订阅的是一套持续更新、可以回头验证的资金观察记录。</h2><div><TrackedLink className="capital-primary" href={membershipOffer.groupUrl} event="zsxq_join_click" data={{ source: "join_hero" }} external>进入知识星球订阅 <b>↗</b></TrackedLink><Link className="capital-secondary" href="/qingdan">先领取免费清单</Link></div></header>
    <section className="subscription-sample"><div><span>真实交付样本</span><h2>先看你会收到什么，<br />再看权益。</h2><p>免费领取的是一次完整周清单；订阅后得到同一口径的每日、每周、季度持续记录与历史档案。</p></div><img src="/lead/weekly-list-preview-02.png" width="669" height="1191" alt="路见资本一周资金清单真实交付样本" /></section>
    <section className="subscription-value"><div><span>你真正获得的</span><h2>不是一次性的结论，<br />而是三个时间尺度。</h2></div><div>{membershipOffer.deliverables.map((item, index) => <article key={item}><b>0{index + 1}</b><p>{item}</p></article>)}</div></section>
    <section className="subscription-calendar"><article><span>交易日收盘</span><h2>完整90行业清单</h2><p>前三进攻、主要撤退、连续流入、回流、脉冲与分歧。</p></article><article><span>每周六</span><h2>一周资金战场</h2><p>把五日快照连起来，回答资金究竟停留还是离开。</p></article><article><span>每季度</span><h2>资金迁徙报告</h2><p>全市场资金矩阵，加2—3条产业主线的订单与现金流验证。</p></article></section>
    <section className="subscription-price"><div><small>ANNUAL MEMBERSHIP</small><strong><i>¥</i>{membershipOffer.priceYuan}</strong><span>有效期一年｜知识星球承载</span></div><div><h2>{membershipOffer.brand}</h2><p>付款、会员身份、完整PDF和历史资料全部由知识星球管理。官网不保存支付资料，也不设置共享密码。</p><TrackedLink className="primary-button button-dark" href={membershipOffer.groupUrl} event="zsxq_join_click" data={{ source: "join_price" }} external>进入知识星球 <b>→</b></TrackedLink></div></section>
    <section className="subscription-fit"><article><span>适合你，如果</span><p>你希望每天、每周和季度都按同一口径查看行业资金，并保留后续验证和修正。</p></article><article><span>不适合你，如果</span><p>你期待实时喊单、精确买卖点、个性化持仓诊断或收益承诺。</p></article></section>
    <section className="subscription-faq"><h2>购买前最常见的三个问题</h2><details><summary>免费清单和订阅有什么不同？</summary><p>免费清单是一次完整周度体验；订阅提供交易日、周度、季度持续更新和历史资料。</p></details><details><summary>数据冲突时怎么处理？</summary><p>明确标记来源差异和不可比项目，不使用旧数据补齐，也不为保持更新而编造结论。</p></details><details><summary>是否提供个股买卖建议？</summary><p>不提供。产品只记录行业资金、产业证据和后续验证条件。</p></details></section>
    <section className="join-boundary"><div><span>内容边界</span><p>追踪行业资金、主线变化、产业付款人、订单、收入、毛利率和现金流。</p></div><div><span>明确不提供</span><p>实时喊单、具体买卖点、收益承诺、个人持仓诊断或持仓复制。</p></div></section>
  </main><SiteFooter /></>;
}
