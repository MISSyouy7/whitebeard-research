'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { PublicNote } from '../../lib/research';
export function ResearchLibrary({ notes }: { notes: Omit<PublicNote, 'content'>[] }) {
  const [category, setCategory] = useState('全部');
  const [query, setQuery] = useState('');
  const categories = ['全部', ...new Set(notes.map(note => note.category))];
  const filtered = notes.filter(note => (category === '全部' || note.category === category) && `${note.title} ${note.summary} ${note.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="lj-library-tools"><div className="lj-tabs" aria-label="研究分类">{categories.map(item => <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div><label className="lj-search"><span aria-hidden="true">⌕</span><input aria-label="搜索研究" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索产业、公司或关键词" /></label></div><div className="lj-research-grid lj-library-grid">{filtered.map(note => <Link key={note.slug} className="lj-research-card" href={`/research/${note.slug}/`}><div className="lj-card-top"><span>{note.category}</span><time>{note.date}</time></div><h2>{note.title}</h2><p>{note.summary}</p><div className="lj-card-bottom"><span>{note.tags.slice(0, 2).join(' / ')}</span><span>↗</span></div></Link>)}</div>{!filtered.length && <p className="lj-empty">未找到匹配研究，试试其他关键词。</p>}</>;
}
