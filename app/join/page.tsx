import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { membershipOffer } from "@/lib/membership";

export const metadata: Metadata = { title: "订阅资金战场｜299元一年", description: "订阅每日90行业资金清单、每周资金战场和季度资金迁徙报告。" };

export default function JoinPage() {
  return <><SiteHeader /><main className="join-page section-shell">
    <header className="subscription-hero"><p>路见资本 · 年度订阅</p><h1><span>{membershipOffer.priceYuan}元</span>一年，<br />不购买涨跌预测。</h1><h2>订阅的是一套持续更新、可以回头验证的资金观察记录。</h2><div><a className="capital-primary" href={membershipOffer.groupUrl} target="_blank" rel="noreferrer">进入知识星球订阅 <b>↗</b></a><Link className="capital-secondary" href="/qingdan">先领取免费清单</Link></div></header>
    <section className="subscription-value"><div><span>你真正获得的</span><h2>不是一次性的结论，<br />而是三个时间尺度。</h2></div><div>{membershipOffer.deliverables.map((item, index) => <article key={item}><b>0{index + 1}</b><p>{item}</p></article>)}</div></section>
    <section className="subscription-calendar"><article><span>交易日收盘</span><h2>完整90行业清单</h2><p>前三进攻、主要撤退、连续流入、回流、脉冲与分歧。</p></article><article><span>每周六</span><h2>一周资金战场</h2><p>把五日快照连起来，回答资金究竟停留还是离开。</p></article><article><span>每季度</span><h2>资金迁徙报告</h2><p>全市场资金矩阵，加2—3条产业主线的订单与现金流验证。</p></article></section>
    <section className="subscription-price"><div><small>ANNUAL MEMBERSHIP</small><strong><i>¥</i>{membershipOffer.priceYuan}</strong><span>有效期一年｜知识星球承载</span></div><div><h2>路见资本·资金战场研究室</h2><p>付款、会员身份、完整PDF和历史资料全部由知识星球管理。官网不保存支付资料，也不设置共享密码。</p><a className="primary-button button-dark" href={membershipOffer.groupUrl} target="_blank" rel="noreferrer">进入知识星球 <b>→</b></a></div></section>
    <section className="join-boundary"><div><span>内容边界</span><p>追踪行业资金、主线变化、产业付款人、订单、收入、毛利率和现金流。</p></div><div><span>明确不提供</span><p>实时喊单、具体买卖点、收益承诺、个人持仓诊断或持仓复制。</p></div></section>
  </main><SiteFooter /></>;
}
