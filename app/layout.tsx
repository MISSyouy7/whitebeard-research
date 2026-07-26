import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baihuzigl.com";
const assetBase = process.env.PAGES_BASE_PATH ?? "";
const metadataOrigin = new URL(siteUrl).origin;

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
  title: {
    default: "白胡子研究院｜面向股民的 AI 产业链研究",
    template: "%s｜白胡子研究院",
  },
  description: "面向个人投资者的 AI 产业链研究平台，聚焦 AI 算力与硬件、具身智能、物理 AI 及上市公司跟踪。",
  keywords: ["白胡子研究院", "白胡子盐话", "股票研究", "AI产业链", "具身智能", "物理AI", "上市公司研究"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "白胡子研究院",
    title: "白胡子研究院｜面向股民的 AI 产业链研究",
    description: "把 AI 产业变化研究成可跟踪的股票线索，持续连接产业环节、上市公司与财务验证。",
    images: [{ url: `${assetBase}/og-research.png`, width: 1536, height: 1024, alt: "白胡子研究院｜面向股民的 AI 产业链研究" }],
  },
  twitter: { card: "summary_large_image", images: [`${assetBase}/og-research.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
