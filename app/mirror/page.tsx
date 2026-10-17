import type { Metadata } from 'next';
import MarketGame from '../market-game';
export const metadata: Metadata = { title: '股市照妖镜｜路见资本', description: '十万虚拟本金，十五次情境选择。走过一段虚构行情，生成你的股市角色卡与本局复盘。' };
export default function MirrorPage() { return <MarketGame />; }
