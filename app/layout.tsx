import type { Metadata } from "next";
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
      description: "看见资本流向，理解产业周期，记录市场情绪。",
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
    default: "路见资本｜看见资本流向，理解产业周期",
    template: "%s｜路见资本",
  },
  description: "路见资本是一套面向个人投资者的资本观察系统，持续记录资金迁徙、产业周期、市场情绪与A股研究。",
  keywords: ["路见资本", "广路", "资金迁徙", "产业周期", "A股研究", "资本观察", "女性财经漫画"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "路见资本",
    title: "路见资本｜看见资本流向，理解产业周期",
    description: "看见资本流向，理解产业周期，记录市场情绪。",
    images: [{ url: `${assetBase}/og-lujian-capital.png`, width: 1693, height: 929, alt: "路见资本抽象资本迁徙地图" }],
  },
  twitter: { card: "summary_large_image", images: [`${assetBase}/og-lujian-capital.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }} />
        {children}
      </body>
    </html>
  );
}
