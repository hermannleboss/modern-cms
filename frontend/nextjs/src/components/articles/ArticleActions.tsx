"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import {
  usePublishArticle,
  useSubmitArticleForReview,
  useArchiveArticle,
} from "@/hooks/useArticles";
import { Permission } from "@/types";
import type { Article } from "@/types";
import { ArticleStatus } from "@/types";

interface ArticleActionsProps {
  article: Article;
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const router = useRouter();
  const publishMutation = usePublishArticle();
  const submitForReviewMutation = useSubmitArticleForReview();
  const archiveMutation = useArchiveArticle();

  const error =
    publishMutation.error ||
    submitForReviewMutation.error ||
    archiveMutation.error;

  const handlePublish = () => {
    publishMutation.mutate(article.id, {
      onSuccess: () => router.refresh(),
    });
  };

  const handleSubmitForReview = () => {
    submitForReviewMutation.mutate(article.id, {
      onSuccess: () => router.refresh(),
    });
  };

  const handleArchive = () => {
    archiveMutation.mutate(article.id, {
      onSuccess: () => router.refresh(),
    });
  };

  return (
    <div className="space-y-3">
      {error && (
        <Alert
          type="error"
          message={
            error instanceof Error
              ? error.message
              : "An error occurred"
          }
        />
      )}

      <div className="flex flex-wrap gap-2">
        {article.status === ArticleStatus.DRAFT && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSubmitForReview}
            isLoading={submitForReviewMutation.isPending}
          >
            Submit for Review
          </Button>
        )}

        {(article.status === ArticleStatus.DRAFT ||
          article.status === ArticleStatus.IN_REVIEW) && (
          <PermissionGuard permission={Permission.ARTICLE_PUBLISH}>
            <Button
              size="sm"
              onClick={handlePublish}
              isLoading={publishMutation.isPending}
            >
              Publish
            </Button>
          </PermissionGuard>
        )}

        {(article.status === ArticleStatus.PUBLISHED ||
          article.status === ArticleStatus.IN_REVIEW) && (
          <PermissionGuard permission={Permission.ARTICLE_ARCHIVE}>
            <Button
              variant="danger"
              size="sm"
              onClick={handleArchive}
              isLoading={archiveMutation.isPending}
            >
              Archive
            </Button>
          </PermissionGuard>
        )}
      </div>
    </div>
  );
}
