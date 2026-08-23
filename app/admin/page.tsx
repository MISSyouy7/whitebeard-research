import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "内容后台",
  description: "路见资本的资金迁徙、主线生命、A股棋盘、研究文章与财经漫画发布入口。",
  robots: { index: false, follow: false },
};

const cmsRoot = "https://app.pagescms.org/MISSyouy7/whitebeard-research/main";
const cmsBase = `${cmsRoot}/collection`;

const actions = [
  { index: "01", title: "更新资金迁徙", description: "填写交易日期、流入流出、连续性、来源口径、反方证据和风险。", href: `${cmsBase}/capital-flow/new`, label: "新建资金记录" },
  { index: "02", title: "更新主线生命", description: "更新产业阶段、公司映射、催化、风险、证伪条件和跟踪指标。", href: `${cmsBase}/mainline/new`, label: "新建主线记录" },
  { index: "03", title: "更新A股棋盘", description: "维护五枚棋子的阶段与资金状态；没有证据就选择“待核验”。", href: `${cmsBase}/boards/new`, label: "新建棋盘快照" },
  { index: "04", title: "发布研究文章", description: "像公众号一样填写标题、摘要和正文，也可以插入图片。", href: `${cmsBase}/articles/new`, label: "写公开文章" },
  { index: "05", title: "发布她的资本视角", description: "上传封面和按顺序排列的7张漫画，再补充背景、数据和认知提示。", href: `${cmsBase}/her-perspective/new`, label: "发布财经漫画" },
  { index: "06", title: "编辑全部内容", description: "打开后台总目录，继续修改草稿、正式内容、星球试读和历史周报。", href: cmsRoot, label: "打开全部内容" },
];

export default function AdminPage() {
  return <><SiteHeader /><main className="admin-page section-shell">
    <header className="page-masthead admin-masthead"><p>WRITE / VERIFY / PUBLISH</p><h1>内容后台</h1><span>选择要更新的研究模块，写完后再决定保存草稿还是正式发布。</span></header>
    <section className="admin-simple-head"><span>六个直达入口</span><h2>更新什么，<br />就点击什么。</h2></section>
    <section className="admin-action-grid admin-six-grid" aria-label="内容管理入口">{actions.map((action) => <article key={action.index}><b>{action.index}</b><h2>{action.title}</h2><p>{action.description}</p><div className="admin-card-links"><a href={action.href} target="_blank" rel="noreferrer">{action.label} →</a></div></article>)}</section>
    <section className="admin-publish-flow"><div><span>固定发布流程</span><h2>先保存草稿，<br />核验完成再发布</h2><p>新内容默认是草稿，官网不可见。日期、网址文件名和文章阅读时间由系统处理；资金时间、来源和风险需要你明确填写。</p></div><ol><li><b>1</b><div><strong>选择模块并填写</strong><p>按表单完成必填项，图片支持 PNG、JPG 和 WebP。</p></div></li><li><b>2</b><div><strong>检查事实边界</strong><p>区分事实、判断和推测，确认来源、反方证据与证伪条件。</p></div></li><li><b>3</b><div><strong>选择正式发布并保存</strong><p>等待网站自动更新，内容才会出现在对应页面。</p></div></li></ol></section>
    <section className="admin-publish-flow admin-zsxq-flow"><div><span>星球专享</span><h2>先发全文，<br />官网只放试读</h2><p>知识星球继续管理收费与全文权限。官网只保存200—400字摘要、恰好3个要点和对应主题链接。</p></div><ol><li><b>1</b><div><strong>知识星球发布全文</strong><p>全文不复制进公开仓库。</p></div></li><li><b>2</b><div><strong>打开星球试读表单</strong><p>填写摘要、3个要点和主题分享链接。</p></div></li><li><b>3</b><div><strong>核验后发布</strong><p><a href={`${cmsBase}/previews/new`} target="_blank" rel="noreferrer">新建星球试读 ↗</a></p></div></li></ol></section>
    <section className="admin-finish"><Link className="outline-button" href="/">查看官网首页 <span>→</span></Link><p>保存后通常需要等待几分钟。官网更新不会自动群发，公众号、小红书等平台仍需分享对应页面链接。</p></section>
    <aside className="admin-notice"><strong>发布前检查</strong><p>不要填写交易账户、个人持仓、客户名单、付费记录或未经核验的订单和业绩数字；不提供喊单、收益承诺或确定性受益结论。</p></aside>
  </main><SiteFooter /></>;
}
