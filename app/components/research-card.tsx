import Link from 'next/link';
import type { ResearchCardItem } from '../../lib/research';

export function ResearchCard({ note, onOpen, heading = 'h2' }: { note: ResearchCardItem; onOpen?: () => void; heading?: 'h2' | 'h3' }) {
  const Heading = heading;
  const content = <>
    <div className="lj-card-top"><span>{note.category}</span><time dateTime={note.date}>{note.publication ? '更新 ' : ''}{note.date}</time></div>
    <Heading>{note.title}</Heading>
    <p>{note.summary.replace(/【事实】|【判断】/g, '')}</p>
    <div className="lj-card-bottom"><span>{note.publication ? '站内阅读 · 本期导读' : `${note.readingMinutes} 分钟阅读 · ${note.tags[0] || '产业观察'}`}</span><span aria-hidden="true">→</span></div>
  </>;
  return <Link className="lj-research-card" href={`/research/${note.slug}/`} onClick={onOpen}>{content}</Link>;
}
