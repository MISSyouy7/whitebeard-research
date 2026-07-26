import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "内容后台",
  description: "白胡子研究院的文章写作、编辑与发布入口。",
  robots: { index: false, follow: false },
};

const cmsBase = "https://app.pagescms.org/MISSyouy7/whitebeard-research/main/collection";

const actions = [
  {
    index: "01",
    title: "写新文章",
    description: "打开空白文章模板，填写标题、摘要和正文。第一次使用时登录 GitHub。",
    label: "开始写文章",
    href: `${cmsBase}/articles/new`,
  },
  {
    index: "02",
    title: "编辑文章",
    description: "查看全部草稿和已发布文章，点击标题继续修改。",
    label: "打开文章列表",
    href: `${cmsBase}/articles`,
  },
  {
    index: "03",
    title: "更新本周",
    description: "修改本周研究问题、当前进度和判断变化。",
    label: "打开每周跟踪",
    href: `${cmsBase}/weekly`,
  },
];

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main className="admin-page section-shell">
        <header className="page-masthead admin-masthead">
          <p>WRITE / EDIT / PUBLISH</p>
          <h1>内容后台</h1>
          <span>像公众号一样：写文章、保存草稿、确认后发布。</span>
        </header>

        <section className="admin-simple-head">
          <span>只需要记住三个入口</span>
          <h2>你想做什么，<br />就点击什么。</h2>
        </section>

        <section className="admin-action-grid" aria-label="内容管理入口">
          {actions.map((action) => (
            <a href={action.href} target="_blank" rel="noreferrer" key={action.index}>
              <b>{action.index}</b>
              <h2>{action.title}</h2>
              <p>{action.description}</p>
              <span>{action.label} →</span>
            </a>
          ))}
        </section>

        <section className="admin-publish-flow">
          <div>
            <span>发布文章</span>
            <h2>最后只看<br />“发布状态”</h2>
            <p>编辑器中的保存按钮负责保存内容，“发布状态”决定文章是否在官网出现。</p>
          </div>
          <ol>
            <li><b>1</b><div><strong>写作时选择“草稿”</strong><p>可以反复保存，官网读者看不到。</p></div></li>
            <li><b>2</b><div><strong>在编辑器里检查全文</strong><p>确认标题、来源、风险提示和排版。</p></div></li>
            <li><b>3</b><div><strong>改为“正式发布”并保存</strong><p>等待约 1—3 分钟，文章会自动出现在官网。</p></div></li>
          </ol>
        </section>

        <section className="admin-finish">
          <Link className="outline-button" href="/articles">查看官网文章 <span>→</span></Link>
          <p>官网发布不会自动群发给粉丝；发布完成后，再把文章链接分享到公众号、小红书或其他平台。</p>
        </section>

        <aside className="admin-notice">
          <strong>安全提醒</strong>
          <p>后台只保存准备公开的内容。不要填写身份证、手机号、交易账户、个人持仓、客户名单或付费记录。</p>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
