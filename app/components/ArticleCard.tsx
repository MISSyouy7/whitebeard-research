import Link from "next/link";
import type { ResearchEntry } from "@/lib/content";
import { formatDate } from "@/lib/content";

type Props = {
  article: ResearchEntry;
  index?: number;
  compact?: boolean;
};

export function ArticleCard({ article, index, compact = false }: Props) {
  const isZsxq = article.access === "zsxq";
  return (
    <article className={`article-card${compact ? " article-card-compact" : ""}`}>
      <div className="article-number">{String(index ?? 1).padStart(2, "0")}</div>
      <div className="article-card-body">
        <div className="article-meta">
          <Link href={`/categories/${article.categorySlug}`}>{article.category}</Link>
          <span>{formatDate(article.date)}</span>
          <span>广路</span>
          <span className={`access-badge access-${article.access}`}>{isZsxq ? "星球专享" : "公开全文"}</span>
        </div>
        <h3><Link href={`/articles/${article.slug}`}>{article.title}</Link></h3>
        <p>{article.description}</p>
        <div className="article-card-footer">
          <div className="entry-note">{isZsxq ? "摘要＋3个要点" : `${article.readingTime} 分钟阅读`}</div>
          <Link className="read-link" href={`/articles/${article.slug}`} aria-label={`阅读《${article.title}》`}>
            {isZsxq ? "查看试读" : "阅读全文"} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
