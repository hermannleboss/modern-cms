"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Article } from "@/types";
import { Permission } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { ArticleActions } from "./ArticleActions";
import { LockIndicator } from "./LockIndicator";
import { useDeleteArticle } from "@/hooks/useArticles";
import { usePermissions } from "@/hooks/usePermissions";
import { Alert } from "@/components/ui/Alert";

interface ArticleDetailProps {
  article: Article;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  const router = useRouter();
  const deleteMutation = useDeleteArticle();
  const permissions = usePermissions();

  const canEdit = permissions.canEditArticle(article.author.id);

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    deleteMutation.mutate(article.id, {
      onSuccess: () => router.push("/articles"),
    });
  };

  return (
    <div className="space-y-6">
      {deleteMutation.isError && (
        <Alert type="error" message="Failed to delete article" />
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={article.status} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>By {article.author.name}</span>
            {article.coAuthors.length > 0 && (
              <span>
                Co-authors:{" "}
                {article.coAuthors.map((a) => a.name).join(", ")}
              </span>
            )}
            <span>
              Updated {new Date(article.updatedAt).toLocaleDateString()}
            </span>
            {article.publishedAt && (
              <span>
                Published{" "}
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/articles/${article.id}/preview`}>
            <Button variant="ghost" size="sm">
              Preview
            </Button>
          </Link>
          {canEdit && (
            <Link href={`/articles/${article.id}/edit`}>
              <Button variant="secondary" size="sm">
                Edit
              </Button>
            </Link>
          )}
          <PermissionGuard
            permissions={[
              Permission.ARTICLE_UPDATE_ANY,
              Permission.ARTICLE_UPDATE_OWN,
            ]}
          >
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <LockIndicator article={article} />

      <ArticleActions article={article} />

      {(article.categories.length > 0 || article.tags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {article.categories.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
            >
              {cat.name}
            </span>
          ))}
          {article.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {article.excerpt && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h2 className="mb-2 text-sm font-medium text-gray-500">Excerpt</h2>
          <p className="text-gray-700">{article.excerpt}</p>
        </div>
      )}

      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap text-gray-800">
          {article.content}
        </div>
      </div>

      {article.revisionHistory.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Revision History
          </h2>
          <div className="space-y-3">
            {article.revisionHistory.map((revision) => (
              <div
                key={revision.id}
                className="rounded-md border border-gray-200 p-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Edited by {revision.editedBy.name}
                  </span>
                  <span className="text-gray-400">
                    {new Date(revision.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
