import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "股市照妖镜｜第一季：我不是股神",
 description: "十万虚拟本金，十五次情境选择。走过一段虚构行情，生成你的股市角色卡与本局复盘。",
 icons: { icon: "/favicon.svg" },
 openGraph: { title: "股市照妖镜", description: "十五道情境选择，照出三十种股民精神状态。", locale: "zh_CN", type: "website" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="zh-CN"><body>{children}</body></html>;
}
