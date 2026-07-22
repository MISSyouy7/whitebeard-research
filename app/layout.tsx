import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const assetBase = process.env.PAGES_BASE_PATH ?? "";
const metadataOrigin = new URL(siteUrl).origin;

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
  title: {
    default: "白胡子研究院｜把复杂的问题研究清楚",
    template: "%s｜白胡子研究院",
  },
  description: "白胡子盐话官方网站。关注宏观策略、产业趋势、公司价值与研究方法，保持好奇，尊重事实，延迟判断。",
  keywords: ["白胡子研究院", "白胡子盐话", "产业研究", "公司研究", "宏观策略"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "白胡子研究院",
    title: "白胡子研究院｜把复杂的问题研究清楚",
    description: "不追逐每一个热点。关注真正影响长期价值的变量。",
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
