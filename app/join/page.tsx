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
      <div><h2>先免费同行，<br />再决定要不要走得更深。</h2><p>公开研究始终保留在官网。更深入的研究服务仍在准备，开放时间与具体方式以官网正式说明为准。</p></div>
    </section>
    <section className="join-path" aria-label="加入路径">
      <article><b>01</b><small>现在即可</small><h2>免费公开研究</h2><p>收藏官网，阅读每周跟踪、完整研究与判断修正记录。</p><Link href="/weekly">从本周开始 ↗</Link></article>
      <article><b>02</b><small>正在登记</small><h2>研究候补名单</h2><p>通过白胡子的公开账号私信关键词，登记后续研究服务意向：</p><strong className="join-keyword">研究院</strong></article>
      <article><b>03</b><small>准备完成后</small><h2>深度研究服务</h2><p>开放后会在官网说明研究内容、更新周期、承载方式和费用，不通过私下承诺提前收费。</p><span>当前尚未开放</span></article>
    </section>
    <section className="join-boundary">
      <div><span>提供什么</span><p>产业跟踪简报、完整产业或公司研究、集中答疑、原有判断与反方证据更新。</p></div>
      <div><span>不提供什么</span><p>实时喊单、具体买卖点、收益承诺、个人持仓复制或用公开内容为持仓制造交易动机。</p></div>
    </section>
  </main><SiteFooter /></>;
}
