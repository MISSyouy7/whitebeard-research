import type { Metadata } from "next";
import { AnalyticsScript } from "@/app/components/Analytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baihuzigl.com";
const assetBase = process.env.PAGES_BASE_PATH ?? "";
const metadataOrigin = new URL(siteUrl).origin;
const websiteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${metadataOrigin}/#website`,
      name: "路见资本",
      alternateName: "LUJIAN CAPITAL",
      url: metadataOrigin,
      description: "每天追踪A股行业资金迁徙，区分进攻、回流、脉冲与撤退。",
      inLanguage: "zh-CN",
    },
    {
      "@type": "Organization",
      "@id": `${metadataOrigin}/#organization`,
      name: "路见资本",
      alternateName: "LUJIAN CAPITAL",
      url: metadataOrigin,
      founder: { "@type": "Person", name: "广路" },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
  title: {
    default: "路见资本｜每天追踪资金迁徙",
    template: "%s｜路见资本",
  },
  description: "路见资本持续记录A股行业资金迁徙，提供每日90行业清单、每周资金战场与季度资金报告，只记录，不预测。",
  keywords: ["路见资本", "广路", "资金迁徙", "产业周期", "A股研究", "资本观察", "女性财经漫画"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "路见资本",
    title: "路见资本｜每天追踪资金迁徙",
    description: "今天的钱在离开什么，正在聚集到哪里？只记录资金变化，不预测涨跌。",
    images: [{ url: `${assetBase}/og-lujian-capital.png`, width: 1693, height: 929, alt: "路见资本抽象资本迁徙地图" }],
  },
  twitter: { card: "summary_large_image", images: [`${assetBase}/og-lujian-capital.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }} />
        <AnalyticsScript />
        {children}
      </body>
    </html>
  );
}
