import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResearchNotes } from '../../../lib/research';
import { markdownToHtml } from '../../../lib/content';
import { SiteHeader, SiteFooter } from '../../components/site-chrome';
import '../../capital.css';
import { ArticleNavigation, type OutlineItem } from '../../components/article-navigation';
import { ResearchBackLink } from '../../components/research-navigation';
export function generateStaticParams() { return getResearchNotes().map(note => ({ slug: note.slug })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = getResearchNotes().find(item => item.slug === slug);
  return { title: note ? `${note.title}｜路见资本` : '研究未找到｜路见资本', description: note?.summary };
}
export default async function ResearchArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getResearchNotes().find(item => item.slug === slug);
  if (!note) notFound();
  const outline: OutlineItem[] = [];
  const html = markdownToHtml(note.content).replace(/<h([2-4])>(.*?)<\/h\1>/g, (_, level: string, title: string) => {
    const id = `research-section-${outline.length + 1}`;
    outline.push({ id, text: title.replace(/<[^>]+>/g, ''), level: Number(level) });
    return `<h${level} id="${id}" tabindex="-1">${title}</h${level}>`;
  });
  return <div className="lj-site" id="top"><SiteHeader /><main className="lj-article">
    <div className="lj-article-heading"><ResearchBackLink /><div className="lj-kicker">{note.category} / <time dateTime={note.date}>{note.date}</time></div><h1>{note.title}</h1><p className="lj-article-summary">{note.summary}</p><div className="lj-article-byline">{note.publication ? '路见资本 · 周刊导读' : '路见资本 · 广路'} <span>{note.readingMinutes} 分钟阅读 · 数据以文中日期为准</span></div></div>
    <div className="lj-reading-grid"><ArticleNavigation items={outline} minutes={note.readingMinutes} /><div><div className="lj-prose" dangerouslySetInnerHTML={{ __html: html }} />{note.sourceUrl && <div className="lj-periodical-original"><p>本页为站内导读与篇目索引。完整刊物按需查阅。</p><a className="lj-text-link" href={note.sourceUrl} target="_blank" rel="noopener noreferrer">查看原刊 ↗</a></div>}<div className="lj-reading-finish"><span className="lj-kicker">继续阅读</span><h2>把判断，留给持续验证。</h2><p>回到研究列表，继续沿着产业与市场寻找证据。</p><ResearchBackLink /><Link className="lj-text-link" href="/#news">查看市场快讯 →</Link></div></div></div>
  </main><SiteFooter /></div>;
}
