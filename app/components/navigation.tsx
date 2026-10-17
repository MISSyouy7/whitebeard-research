'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Section = 'home' | 'news' | 'limit-up' | 'research' | 'about';

function NavIcon({ type }: { type: Section }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {type === 'home' ? <><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7" /></> : type === 'news' ? <><path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h3M14 15h2M8 18h3M14 18h2" /></> : type === 'limit-up' ? <><path d="M4 3v17h17M8 16v-5M13 16V6M18 16V9" /></> : <><path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15M6 8h3M15 8h3M6 12h3M15 12h3" /></>}
  </svg>;
}

export function SiteNavigation() {
  const pathname = usePathname();
  const [section, setSection] = useState<Section>('home');
  const researchPage = pathname?.includes('/research');
  const active = researchPage ? 'research' : section;

  useEffect(() => {
    if (researchPage) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current: Section = 'home';
        for (const id of ['news', 'limit-up', 'research', 'about'] as Section[]) {
          const element = document.getElementById(id);
          if (element && element.getBoundingClientRect().top < window.innerHeight * 0.38) current = id;
        }
        setSection(current);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [pathname, researchPage]);

  const desktop = [{ id: 'news', name: '热点新闻', href: '/#news' }, { id: 'limit-up', name: '涨停复盘', href: '/#limit-up' }, { id: 'research', name: '研究洞察', href: '/research/' }, { id: 'about', name: '关于路见', href: '/#about' }];
  const mobile = [{ id: 'home', name: '首页', href: '/#top' }, { id: 'news', name: '快讯', href: '/#news' }, { id: 'limit-up', name: '复盘', href: '/#limit-up' }, { id: 'research', name: '研究', href: '/research/' }];
  return <>
    <nav className="lj-desktop-nav" aria-label="主导航">{desktop.map(item => <Link key={item.id} href={item.href} aria-current={active === item.id ? 'location' : undefined}>{item.name}</Link>)}</nav>
    <nav className="lj-mobile-nav" aria-label="手机快捷导航">{mobile.map(item => <Link key={item.id} href={item.href} aria-current={active === item.id ? 'location' : undefined}><NavIcon type={item.id as Section} /><span>{item.name}</span></Link>)}</nav>
  </>;
}

export function CopyAccount() {
  const [feedback, setFeedback] = useState('');
  return <div className="lj-copy-account"><button onClick={async () => {
    try { await navigator.clipboard.writeText('路见资本'); setFeedback('已复制，去微信搜索即可'); }
    catch { setFeedback('请长按或选中「路见资本」复制'); }
  }}>复制公众号名称 <span aria-hidden="true">↗</span></button><span role="status">{feedback}</span></div>;
}
