import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "加入研究院",
  description: "收藏白胡子研究院永久网址，获取公开研究，并登记 AI 产业链研究内测意向。",
};

export default function JoinPage() {
  return <><SiteHeader /><main className="join-page section-shell">
    <header className="page-masthead join-masthead"><p>JOIN / STAY CONNECTED</p><h1>加入</h1><span>这不是复杂的会员中心，而是一条不会失联的研究路径。</span></header>
    <section className="join-intro">
      <div><span>永久名片</span><strong>baihuzigl.com</strong></div>
      <div><h2>先免费同行，<br />再决定要不要走得更深。</h2><p>公开研究始终保留在官网。付费内测只有在需求被真实验证后才会开放，不用现在付款，也不承诺收益或实时交易指导。</p></div>
    </section>
    <section className="join-path" aria-label="加入路径">
      <article><b>01</b><small>现在即可</small><h2>免费公开研究</h2><p>收藏官网，阅读每周跟踪、完整研究与判断修正记录。</p><Link href="/weekly">从本周开始 ↗</Link></article>
      <article><b>02</b><small>正在登记</small><h2>内测候补名单</h2><p>从你来的公众号、小红书或爱股票社区，私信白胡子关键词：</p><strong className="join-keyword">研究院</strong></article>
      <article><b>03</b><small>达到门槛后</small><h2>研究内测季</h2><p>计划 199 元 / 8 周，最多 30 人，使用知识星球承载。达到 20 名有效候补且 10 人接受价格后才开放。</p><span>当前未开放收费</span></article>
    </section>
    <section className="join-boundary">
      <div><span>提供什么</span><p>产业跟踪简报、完整产业或公司研究、集中答疑、原有判断与反方证据更新。</p></div>
      <div><span>不提供什么</span><p>实时喊单、具体买卖点、收益承诺、个人持仓复制或用公开内容为持仓制造交易动机。</p></div>
    </section>
  </main><SiteFooter /></>;
}
