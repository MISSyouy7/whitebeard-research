import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getQuarterlyReports } from "@/lib/content";

export const metadata: Metadata = { title: "季度资金报告", description: "路见资本季度资金迁徙报告：全市场资金环境、90行业矩阵和核心产业线验证。" };

export default function QuarterlyPage() {
  const reports = getQuarterlyReports();
  return <><SiteHeader /><main className="quarterly-page section-shell">
    <header className="page-masthead quarterly-masthead"><p>QUARTERLY CAPITAL MIGRATION</p><h1>季度报告</h1><span>抹掉每天的涨跌，只看一个季度的钱如何移动。</span></header>
    <section className="quarterly-intro"><p>每季度结束后7个交易日内交付</p><h2>全市场资金矩阵，<br />再向下追到产业和现金流。</h2><div><span>15—25页手机PDF</span><span>90行业统一口径</span><span>2—3条主线深挖</span></div></section>
    <section className="quarterly-list">{reports.map((report) => <article key={report.slug}><div className="quarter-cover"><span>{report.quarter}</span><strong>资金迁徙<br />季度报告</strong><small>路见资本 · 广路</small></div><div className="quarterly-report-copy"><p>{report.status === "upcoming" ? "即将交付" : formatDate(report.publishedAt)}</p><h2>{report.title}</h2><span>{report.summary}</span><ol>{report.outline.map((item) => <li key={item}>{item}</li>)}</ol><div className="quarter-actions">{report.status === "published" && report.previewFile ? <a className="outline-button" href={report.previewFile}>下载公开试读 <b>↓</b></a> : null}{report.status === "published" && report.zsxqUrl ? <a className="capital-primary" href={report.zsxqUrl} target="_blank" rel="noreferrer">去知识星球阅读全文 <b>↗</b></a> : <Link className="outline-button" href="/join">查看年度订阅 <b>→</b></Link>}</div></div></article>)}</section>
    <section className="quarterly-boundary"><div><span>模型边界</span><p>所有关注度、强度等归一化数字均标注“模型化展示”，不冒充真实资金指数。</p></div><div><span>表达边界</span><p>未经证据证明，不表达某板块资金直接转入另一板块。</p></div><div><span>交付边界</span><p>官网提供摘要与试读；完整PDF由知识星球管理会员权限。</p></div></section>
  </main><SiteFooter /></>;
}
