import Link from "next/link";
import type { Article } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={article.status} />
            {article.lock && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                🔒 Locked by {article.lock.lockedBy.name}
              </span>
            )}
          </div>

          <Link href={`/articles/${article.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {article.title}
            </h3>
          </Link>

          {article.excerpt && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {article.excerpt}
            </p>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span>By {article.author.name}</span>
            {article.coAuthors.length > 0 && (
              <span>
                +{article.coAuthors.length} co-author
                {article.coAuthors.length > 1 ? "s" : ""}
              </span>
            )}
            <span>
              {new Date(article.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {(article.categories.length > 0 || article.tags.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {article.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                >
                  {cat.name}
                </span>
              ))}
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
