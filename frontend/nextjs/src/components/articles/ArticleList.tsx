"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useArticles, useDeleteArticle } from "@/hooks/useArticles";
import { usePermissions } from "@/hooks/usePermissions";
import { ArticleCard } from "./ArticleCard";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Permission, ArticleStatus } from "@/types";
import type { ArticleStatusType } from "@/types";

const statusFilters: { label: string; value: ArticleStatusType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: ArticleStatus.DRAFT },
  { label: "In Review", value: ArticleStatus.IN_REVIEW },
  { label: "Published", value: ArticleStatus.PUBLISHED },
  { label: "Archived", value: ArticleStatus.ARCHIVED },
];

export function ArticleList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") as
    | ArticleStatusType
    | null;
  const page = Number(searchParams.get("page") || "1");

  const { data, isLoading, error } = useArticles({
    status: statusFilter ?? undefined,
    page,
    limit: 10,
  });
  const deleteMutation = useDeleteArticle();
  const permissions = usePermissions();

  const handleStatusFilter = (status: ArticleStatusType | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    router.push(`/articles?${params.toString()}`);
  };

  if (error) {
    return (
      <Alert
        type="error"
        message={
          error instanceof Error
            ? error.message
            : "Failed to load articles"
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <PermissionGuard permission={Permission.ARTICLE_CREATE}>
          <Link href="/articles/new">
            <Button>New Article</Button>
          </Link>
        </PermissionGuard>
      </div>

      <div className="flex gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleStatusFilter(filter.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              (filter.value === "all" && !statusFilter) ||
              filter.value === statusFilter
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No articles found.</p>
          {permissions.has(Permission.ARTICLE_CREATE) && (
            <Link href="/articles/new">
              <Button variant="secondary" className="mt-4">
                Create your first article
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  const params = new URLSearchParams(
                    searchParams.toString(),
                  );
                  params.set("page", String(page - 1));
                  router.push(`/articles?${params.toString()}`);
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => {
                  const params = new URLSearchParams(
                    searchParams.toString(),
                  );
                  params.set("page", String(page + 1));
                  router.push(`/articles?${params.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {deleteMutation.isError && (
        <Alert
          type="error"
          message="Failed to delete article"
        />
      )}
    </div>
  );
}
