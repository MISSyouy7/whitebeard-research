'use client';
import { useEffect, useState } from 'react';
export type OutlineItem = { id: string; text: string; level: number };
export function ArticleNavigation({ items, minutes }: { items: OutlineItem[]; minutes: number }) {
  const [active, setActive] = useState(items[0]?.id || '');
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = items[0]?.id || '';
        for (const item of items) {
          const heading = document.getElementById(item.id);
          if (heading && heading.getBoundingClientRect().top <= 190) current = item.id;
        }
        setActive(current);
        const prose = document.querySelector('.lj-prose');
        if (prose) { const rect = prose.getBoundingClientRect(); setProgress(Math.max(0, Math.min(1, (130 - rect.top) / Math.max(1, rect.height - innerHeight + 220)))); }
      });
    };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [items]);
  const links = items.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} className={item.level > 2 ? 'is-subheading' : ''} onClick={event => {
    const detail = event.currentTarget.closest('details');
    if (detail) detail.open = false;
  }}>{item.text}</a>);
  return <aside className="lj-article-navigation"><div className="lj-reading-progress" role="progressbar" aria-label="文章阅读进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><span style={{ transform: `scaleX(${progress})` }} /></div>
    <nav className="lj-desktop-toc" aria-label="文章目录"><span className="lj-kicker">阅读目录</span><h2>这篇研究</h2><p>约 {minutes} 分钟阅读</p>{links}</nav>
    <details className="lj-mobile-toc"><summary>文章目录 <span>约 {minutes} 分钟 · 展开 ↓</span></summary><nav aria-label="文章目录">{links}</nav></details>
  </aside>;
}
