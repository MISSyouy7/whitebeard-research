import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResearchNotes } from '../../../lib/research';
import { markdownToHtml } from '../../../lib/content';
import { SiteHeader, SiteFooter } from '../../components/site-chrome';
import '../../capital.css';
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
  return <div className="lj-site"><SiteHeader /><main className="lj-article"><Link className="lj-text-link" href="/research/">← 返回研究档案</Link><div className="lj-kicker">{note.category} / <time dateTime={note.date}>{note.date}</time></div><h1>{note.title}</h1><p className="lj-article-summary">{note.summary}</p><div className="lj-article-byline">路见资本 · 广路 <span>历史研究 · 观点与数据以文中日期为准</span></div><div className="lj-prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(note.content) }} /><Link className="lj-button lj-button-dark" href="/research/">继续阅读研究 →</Link></main><SiteFooter /></div>;
}
