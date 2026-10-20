import Link from 'next/link';
import type { ResearchCardItem } from '../../lib/research';

export function ResearchCard({ note, onOpen, heading = 'h2' }: { note: ResearchCardItem; onOpen?: () => void; heading?: 'h2' | 'h3' }) {
  const Heading = heading;
  const content = <>
    <div className="lj-card-top"><span>{note.category}</span><time dateTime={note.date}>{note.externalUrl ? '更新 ' : ''}{note.date}</time></div>
    <Heading>{note.title}</Heading>
    <p>{note.summary.replace(/【事实】|【判断】/g, '')}</p>
    <div className="lj-card-bottom"><span>{note.externalUrl ? '阅读本期原文' : `${note.readingMinutes} 分钟阅读 · ${note.tags[0] || '产业观察'}`}</span><span aria-hidden="true">↗</span></div>
  </>;
  return note.externalUrl
    ? <a className="lj-research-card" href={note.externalUrl} target="_blank" rel="noopener noreferrer" onClick={onOpen}>{content}<span className="sr-only">（在新窗口阅读）</span></a>
    : <Link className="lj-research-card" href={`/research/${note.slug}/`} onClick={onOpen}>{content}</Link>;
}
