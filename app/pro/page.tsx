import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { ProInterest } from "@/app/pro/ProInterest";

export const metadata: Metadata = { title: "路见Pro内测", description: "验证公司动态跟踪、产业链更新和核心假设维护的真实需求；当前不收费。" };

export default function ProPage() {
  return <><SiteHeader /><main className="pro-page section-shell">
    <header><p>LUJIAN PRO / VALIDATION ONLY</p><h1>不是更多研报，<br />是一套持续运行的研究系统。</h1><span>路见Pro目前只验证需求，不销售、不收款，也不承诺功能已经上线。</span></header>
    <section className="pro-boundary"><article><small>299元资金战场</small><h2>市场与行业资金</h2><p>每日、每周、季度持续记录90行业资金变化。</p></article><article><small>未来路见Pro</small><h2>公司与产业维护</h2><p>跟踪公告、财报、产业链和核心假设的强化或弱化。</p></article></section>
    <section className="pro-features"><h2>第一步，只确认你真正需要什么。</h2><div><span>动态公司跟踪</span><span>产业链数据库</span><span>研究时间线</span><span>核心假设状态</span><span>研究效率工具</span></div></section>
    <section className="pro-form-section"><div><span>INNER TEST</span><h2>留下需求，<br />不是注册账号。</h2><p>选择功能和价格带后，页面只生成微信口令。联系方式由你主动添加，不写入网站数据库。</p></div><ProInterest /></section>
  </main><SiteFooter /></>;
}
