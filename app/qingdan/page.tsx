/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { IntentReveal } from "@/app/components/IntentReveal";
import { freeListOffer } from "@/lib/membership";

export const metadata: Metadata = {
  title: "领取本周90行业资金清单",
  description: "查看本周资金进攻、回流与撤退方向，添加微信领取完整90行业PDF。",
  robots: { index: false, follow: false },
};

const findings = [
  { label: "一日变脸", title: "科技硬件", value: "周四 +594.74亿 → 周五 -334.55亿" },
  { label: "连续主攻", title: "软件开发", value: "周二至周五连续4日流入" },
  { label: "持续撤退", title: "医药生物", value: "全周净流出 221.15亿" },
] as const;

export default function QingdanPage() {
  return <><header className="site-header"><div className="header-inner"><Link className="brand" href="/" aria-label="路见资本首页"><span className="brand-seal" aria-hidden="true">路</span><span className="brand-copy"><strong>路见资本</strong><small>LUJIAN CAPITAL</small></span></Link><span className="lead-header-note">免费资料领取</span></div></header><main className="lead-page">
    <section className="lead-hero section-shell"><p>路见资本 · 免费资料</p><h1>{freeListOffer.title}</h1><span>{freeListOffer.startDate.replaceAll("-", ".")}—{freeListOffer.endDate.slice(5).replace("-", ".")}｜公开数据整理｜收盘终值</span><div className="lead-findings">{findings.map((item, index) => <article key={item.title}><small>0{index + 1} / {item.label}</small><h2>{item.title}</h2><p>{item.value}</p></article>)}</div></section>
    <section className="lead-visual section-shell"><div><span>本周资金图</span><h2>594亿进攻，<br />只持续了一天。</h2><p>五个已核验收盘快照逐日求和。行业组合只用于栏目表达，不代表板块间逐笔定向转账。</p></div><img src="/lead/weekly-capital-battlefield-2026-08-24-28.png" width="1080" height="1920" alt="2026年8月24日至28日一周资金战场预览" /></section>
    <section className="lead-preview section-shell"><div><span>PDF内含</span><h2>完整90行业清单，<br />不是低价值营销简介。</h2><ol><li>90行业五日资金净额与排名</li><li>持续进攻、阶段回流、单日脉冲、持续撤退</li><li>行业口径、来源差异与不可比项目</li><li>下周只需要继续验证的三个问题</li></ol></div><div className="pdf-preview-pages">{freeListOffer.previewImages.map((image, index) => <img src={image} width="669" height="1191" alt={`完整90行业资金清单第${index + 1}页真实预览`} key={image} />)}<small>真实PDF前两页预览｜完整12页文件通过微信交付</small></div></section>
    <section className="wechat-delivery section-shell single-action-delivery"><div><p>免费领取一次</p><h2>先拿到完整产品，<br />再决定是否持续订阅。</h2><span>不要求注册、登录或填写持仓。点击后显示微信二维码和本周唯一口令。</span></div><IntentReveal buttonLabel="添加微信，领取完整PDF" intentCode={freeListOffer.keyword} qrImage={freeListOffer.qrImage} contactName={freeListOffer.contactName} context="qingdan" description="添加后发送本周口令，完整12页PDF通过微信交付。" showJoinAfterReveal /></section>
    <p className="lead-disclaimer section-shell">仅作市场观察与研究交流，不构成投资建议。资金数据用于观察市场结构，不代表任何行业或个股未来涨跌。</p>
  </main><footer className="lead-footer"><div className="section-shell"><span>路见资本 · 主理人广路</span><p>完整PDF不在公开网页下载，不提供实时喊单或收益承诺。</p></div></footer></>;
}
