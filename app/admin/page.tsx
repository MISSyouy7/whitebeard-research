import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "内容后台",
  description: "白胡子研究院的 Markdown 文章管理入口。",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main className="admin-page section-shell">
        <header className="page-masthead admin-masthead">
          <p>EDITORIAL DESK / PRIVATE ENTRY</p>
          <h1>内容后台</h1>
          <span>登录 GitHub 后，管理研究草稿与正式文章。</span>
        </header>

        <section className="admin-intro">
          <div>
            <span className="admin-index">01</span>
            <h2>文章仍然属于你</h2>
          </div>
          <div>
            <p>后台只负责把表单内容保存成 Markdown 文件，不建立新的数据库，也不改变现有 GitHub Pages 网站。</p>
            <p>只有获得仓库权限的 GitHub 账号可以修改内容。新建文章默认是草稿，不会直接公开。</p>
            <a className="primary-button" href="https://app.pagescms.org/" target="_blank" rel="noreferrer">
              打开文章后台 <span>→</span>
            </a>
          </div>
        </section>

        <section className="admin-steps" aria-label="后台使用步骤">
          <article><b>01</b><h3>登录 GitHub</h3><p>使用创建官网仓库的 GitHub 账号登录，只在首次使用时确认仓库权限。</p></article>
          <article><b>02</b><h3>新建草稿</h3><p>填写标题、英文网址代号、分类、摘要和正文，状态保持“草稿”。</p></article>
          <article><b>03</b><h3>核验后发布</h3><p>补齐来源、反方观点和证伪条件，再把状态改为“正式发布”。</p></article>
        </section>

        <aside className="admin-notice">
          <strong>安全边界</strong>
          <p>不要把身份证、手机号、交易账户、个人持仓、客户名单或付费记录写进文章后台。这里保存的内容会进入公开网站仓库。</p>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
