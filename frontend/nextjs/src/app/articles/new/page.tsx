"use client";

import { useRouter } from "next/navigation";
import { useCreateArticle } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import { ArticleForm } from "@/components/articles/ArticleForm";
import { Alert } from "@/components/ui/Alert";
import type { CreateArticleDTO } from "@/types";

export default function NewArticlePage() {
  const router = useRouter();
  const createMutation = useCreateArticle();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();

  const handleSubmit = (data: CreateArticleDTO) => {
    createMutation.mutate(data, {
      onSuccess: (article) => {
        router.push(`/articles/${article.id}`);
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Article</h1>

      {createMutation.isError && (
        <Alert
          type="error"
          message={
            createMutation.error instanceof Error
              ? createMutation.error.message
              : "Failed to create article"
          }
        />
      )}

      <ArticleForm
        categories={categories}
        tags={tags}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Create Article"
      />
    </div>
  );
}
