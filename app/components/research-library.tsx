'use client';
import Link from 'next/link';
import type { PublicNote } from '../../lib/research';
import { rememberResearch, useResearchFilters } from './research-navigation';

export function ResearchLibrary({ notes }: { notes: Omit<PublicNote, 'content'>[] }) {
  const { category: selected, query, search, update } = useResearchFilters();
  const categories = ['全部', ...new Set(notes.map(note => note.category))];
  const category = categories.includes(selected) ? selected : '全部';
  const filtered = notes.filter(note => (category === '全部' || note.category === category) && `${note.title} ${note.summary} ${note.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  const clear = () => update({ category: '全部', query: '' });
  return <>
    <div className="lj-library-tools"><div className="lj-tabs" aria-label="研究分类">{categories.map(item => <button key={item} onClick={() => update({ category: item, query })} aria-pressed={category === item}>{item}</button>)}</div><label className="lj-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="搜索研究" value={query} onChange={event => update({ category, query: event.target.value })} placeholder="搜索产业、公司或关键词" />{query && <button className="lj-clear-input" aria-label="清空研究搜索" onClick={() => update({ category, query: '' })}>×</button>}</label></div>
    <div className="lj-library-results"><p role="status">{query || category !== '全部' ? '匹配' : '共'} <strong>{filtered.length}</strong> 篇研究{category !== '全部' && ` · ${category}`}</p>{(query || category !== '全部') && <button onClick={clear}>清除筛选 ×</button>}</div>
    <div className="lj-research-grid lj-library-grid">{filtered.map(note => <Link key={note.slug} className="lj-research-card" href={`/research/${note.slug}/`} onClick={() => rememberResearch(search)}><div className="lj-card-top"><span>{note.category}</span><time dateTime={note.date}>{note.date}</time></div><h2>{note.title}</h2><p>{note.summary}</p><div className="lj-card-bottom"><span>{note.readingMinutes} 分钟阅读 · {note.tags[0]}</span><span aria-label="阅读全文">↗</span></div></Link>)}</div>
    {!filtered.length && <div className="lj-research-empty"><span aria-hidden="true">⌕</span><h2>换个关键词，再找找。</h2><p>试试「AI」「具身智能」或「市场复盘」，也可以查看全部研究。</p><button className="lj-button lj-button-dark" onClick={clear}>查看全部研究</button></div>}
  </>;
}
