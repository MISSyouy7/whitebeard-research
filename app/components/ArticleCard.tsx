import Link from "next/link";
import type { Article } from "@/lib/content";
import { formatDate } from "@/lib/content";

type Props = {
  article: Article;
  index?: number;
  compact?: boolean;
};

export function ArticleCard({ article, index, compact = false }: Props) {
  return (
    <article className={`article-card${compact ? " article-card-compact" : ""}`}>
      <div className="article-number">{String(index ?? Number(article.issue)).padStart(2, "0")}</div>
      <div className="article-card-body">
        <div className="article-meta">
          <Link href={`/categories/${article.categorySlug}`}>{article.category}</Link>
          <span>{formatDate(article.date)}</span>
          <span>{article.readingTime} MIN</span>
        </div>
        <h3><Link href={`/articles/${article.slug}`}>{article.title}</Link></h3>
        <p>{article.description}</p>
        <div className="article-card-footer">
          <div className="tag-list">{article.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div>
          <Link className="read-link" href={`/articles/${article.slug}`} aria-label={`阅读《${article.title}》`}>
            阅读全文 <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
