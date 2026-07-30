import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "加入研究院",
  description: "收藏白胡子研究院永久网址，阅读公开研究，并从官网进入知识星球专享全文。",
};

const groupUrl = "https://wx.zsxq.com/group/15554884215522";

export default function JoinPage() {
  return <><SiteHeader /><main className="join-page section-shell">
    <header className="page-masthead join-masthead"><p>JOIN / STAY CONNECTED</p><h1>加入</h1><span>官网负责长期沉淀，知识星球负责订阅与专享全文。</span></header>
    <section className="join-intro">
      <div><span>永久名片</span><strong>baihuzigl.com</strong></div>
      <div><h2>先免费阅读，<br />再决定要不要深入。</h2><p>公开文章保留在官网；标注“星球专享”的内容只展示摘要和三个要点，完整研究由知识星球管理订阅权限。</p></div>
    </section>
    <section className="join-path" aria-label="加入路径">
      <article><b>01</b><small>免费</small><h2>官网公开研究</h2><p>阅读本周跟踪、公开全文、判断修正记录与三个长期研究栏目。</p><Link href="/articles">浏览研究档案 ↗</Link></article>
      <article><b>02</b><small>试读</small><h2>星球文章摘要</h2><p>先在官网阅读200—400字摘要和三个要点，判断内容是否值得继续。</p><Link href="/articles">查看最新试读 ↗</Link></article>
      <article><b>03</b><small>订阅后</small><h2>知识星球全文</h2><p>付费正文不存放在公开官网。订阅、到期与全文权限全部由知识星球处理。</p><a href={groupUrl} target="_blank" rel="noreferrer">进入白胡子研究室 ↗</a></article>
    </section>
    <section className="join-boundary">
      <div><span>内容边界</span><p>产业链研究、A股市场复盘、交易与认知，以及原有判断、反方证据和证伪条件的更新。</p></div>
      <div><span>明确不提供</span><p>实时喊单、具体买卖点、收益承诺、个人持仓复制或用公开内容为持仓制造交易动机。</p></div>
    </section>
  </main><SiteFooter /></>;
}
