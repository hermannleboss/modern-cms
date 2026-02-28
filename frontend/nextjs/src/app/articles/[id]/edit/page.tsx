"use client";

import { useRouter, useParams } from "next/navigation";
import { useArticle, useUpdateArticle } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import { ArticleForm } from "@/components/articles/ArticleForm";
import { LockIndicator } from "@/components/articles/LockIndicator";
import { Alert } from "@/components/ui/Alert";
import type { CreateArticleDTO } from "@/types";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: article, isLoading, error } = useArticle(id);
  const updateMutation = useUpdateArticle(id);
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <Alert
        type="error"
        message={
          error instanceof Error
            ? error.message
            : "Failed to load article"
        }
      />
    );
  }

  const handleSubmit = (data: CreateArticleDTO) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        router.push(`/articles/${id}`);
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>

      <LockIndicator article={article} />

      {updateMutation.isError && (
        <Alert
          type="error"
          message={
            updateMutation.error instanceof Error
              ? updateMutation.error.message
              : "Failed to update article"
          }
        />
      )}

      <ArticleForm
        article={article}
        categories={categories}
        tags={tags}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
