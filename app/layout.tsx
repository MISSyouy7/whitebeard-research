import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baihuzigl.com";
const assetBase = process.env.PAGES_BASE_PATH ?? "";
const metadataOrigin = new URL(siteUrl).origin;

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
  title: {
    default: "白胡子研究院｜AI产业链、A股复盘与交易认知",
    template: "%s｜白胡子研究院",
  },
  description: "面向个人投资者的股票研究平台，沉淀 AI 产业链研究、A股市场复盘、交易认知与知识星球试读。",
  keywords: ["白胡子研究院", "广路", "股票研究", "AI产业链", "A股复盘", "交易认知", "知识星球"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "白胡子研究院",
    title: "白胡子研究院｜AI产业链、A股复盘与交易认知",
    description: "公开研究与星球试读都在这张长期数字名片中持续沉淀。",
    images: [{ url: `${assetBase}/og-research.png`, width: 1536, height: 1024, alt: "白胡子研究院股票研究官网" }],
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
