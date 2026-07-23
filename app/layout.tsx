import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baihuzigl.com";
const assetBase = process.env.PAGES_BASE_PATH ?? "";
const metadataOrigin = new URL(siteUrl).origin;

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
  title: {
    default: "白胡子研究院｜看懂 AI 产业链，跟踪真实变化",
    template: "%s｜白胡子研究院",
  },
  description: "面向个人投资者的 AI 产业链研究平台，聚焦 AI 算力与硬件、具身智能、物理 AI 及上市公司跟踪。",
  keywords: ["白胡子研究院", "白胡子盐话", "AI产业链", "具身智能", "物理AI", "公司研究"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "白胡子研究院",
    title: "白胡子研究院｜看懂 AI 产业链，跟踪真实变化",
    description: "从技术演进、产业结构与公司基本面出发，建立可以持续验证的投资研究框架。",
    images: [{ url: `${assetBase}/og.png`, width: 1536, height: 1024, alt: "白胡子研究院" }],
  },
  twitter: { card: "summary_large_image", images: [`${assetBase}/og.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
