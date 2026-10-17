import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title: '路见资本｜看见产业，理解资本',
 description: '路见资本独立研究：热点新闻、A股涨停复盘与产业洞察。以事实为起点，持续观察产业周期、资金迁徙和市场情绪。',
 icons: { icon: '/favicon.svg' },
 openGraph: { title: '路见资本｜看见产业，理解资本', description: '于喧嚣处，看见资本的方向。热点新闻、涨停复盘、产业研究。', locale: 'zh_CN', type: 'website' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
