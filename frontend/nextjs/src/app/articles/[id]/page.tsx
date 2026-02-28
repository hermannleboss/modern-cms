import { getAccessToken } from "@/lib/auth/session";
import { createArticlesApi } from "@/lib/api/articles";
import { ArticleDetail } from "@/components/articles/ArticleDetail";
import { Alert } from "@/components/ui/Alert";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return <Alert type="error" message="Not authenticated" />;
  }

  try {
    const api = createArticlesApi(accessToken);
    const article = await api.getById(id);

    return (
      <div className="mx-auto max-w-4xl">
        <ArticleDetail article={article} />
      </div>
    );
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 404) {
      notFound();
    }
    return (
      <Alert
        type="error"
        message="Failed to load article. The API server may be unavailable."
      />
    );
  }
}
