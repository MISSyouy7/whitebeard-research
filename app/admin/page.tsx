import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "内容后台",
  description: "白胡子研究院的公开文章、星球试读与每周跟踪发布入口。",
  robots: { index: false, follow: false },
};

const cmsBase = "https://app.pagescms.org/MISSyouy7/whitebeard-research/main/collection";

const actions = [
  {
    index: "01",
    title: "写公开文章",
    description: "填写标题、栏目、摘要和正文。可以像公众号一样排版并插入图片。",
    links: [{ label: "开始写公开文章", href: `${cmsBase}/articles/new` }],
  },
  {
    index: "02",
    title: "发布星球试读",
    description: "先发知识星球全文，再填写公开摘要、3个要点和原文链接。",
    links: [{ label: "新建星球试读", href: `${cmsBase}/previews/new` }],
  },
  {
    index: "03",
    title: "编辑已发内容",
    description: "打开草稿或已发布内容，点击标题继续修改。",
    links: [
      { label: "管理公开文章", href: `${cmsBase}/articles` },
      { label: "管理星球试读", href: `${cmsBase}/previews` },
    ],
  },
  {
    index: "04",
    title: "更新本周",
    description: "修改本周研究问题、当前进度、覆盖方向和判断变化。",
    links: [{ label: "打开每周跟踪", href: `${cmsBase}/weekly` }],
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
          <span>你只需要选择要做的事，不需要理解 GitHub 或文件代码。</span>
        </header>

        <section className="admin-simple-head">
          <span>四个直达入口</span>
          <h2>写什么内容，<br />就点击什么。</h2>
        </section>

        <section className="admin-action-grid" aria-label="内容管理入口">
          {actions.map((action) => (
            <article key={action.index}>
              <b>{action.index}</b>
              <h2>{action.title}</h2>
              <p>{action.description}</p>
              <div className="admin-card-links">
                {action.links.map((link) => <a href={link.href} target="_blank" rel="noreferrer" key={link.href}>{link.label} →</a>)}
              </div>
            </article>
          ))}
        </section>

        <section className="admin-publish-flow">
          <div>
            <span>公开文章</span>
            <h2>写完以后，<br />再选择正式发布</h2>
            <p>新文章默认是草稿。标题、栏目、摘要和正文填写完成后，把“保存方式”改成“正式发布”，再点击编辑器右上角保存。</p>
          </div>
          <ol>
            <li><b>1</b><div><strong>填写内容</strong><p>网址、日期和阅读时间由网站自动处理，不需要你填写。</p></div></li>
            <li><b>2</b><div><strong>插入图片</strong><p>正文工具栏可以上传 PNG、JPG 或 WebP，手机端会自动缩放。</p></div></li>
            <li><b>3</b><div><strong>正式发布并保存</strong><p>等待网站更新后，文章会出现在对应栏目。</p></div></li>
          </ol>
        </section>

        <section className="admin-publish-flow admin-zsxq-flow">
          <div>
            <span>星球专享</span>
            <h2>先发全文，<br />再发布官网试读</h2>
            <p>官网不会保存付费全文。先在知识星球完成发布，再把主题分享链接复制到“星球试读”表单。</p>
          </div>
          <ol>
            <li><b>1</b><div><strong>知识星球发布全文</strong><p>全文、订阅和阅读权限都留在知识星球。</p></div></li>
            <li><b>2</b><div><strong>填写摘要和3个要点</strong><p>摘要控制在200—400字，帮助读者判断文章是否值得继续。</p></div></li>
            <li><b>3</b><div><strong>粘贴原文链接并发布</strong><p>已订阅读者从官网按钮直接进入星球原文。</p></div></li>
          </ol>
        </section>

        <section className="admin-finish">
          <Link className="outline-button" href="/articles">查看官网文章 <span>→</span></Link>
          <p>保存后通常需要等待几分钟。官网上线不会自动群发给粉丝，仍需把文章链接分享到其他平台。</p>
        </section>

        <aside className="admin-notice">
          <strong>发布前检查</strong>
          <p>事实、判断和推测要分开；保留来源、反方观点与证伪条件；不要填写交易账户、个人持仓、客户名单、付费记录或未经核验的订单和业绩数字。</p>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
