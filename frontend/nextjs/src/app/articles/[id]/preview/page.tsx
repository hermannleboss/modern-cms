import { getAccessToken } from "@/lib/auth/session";
import { createArticlesApi } from "@/lib/api/articles";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Alert } from "@/components/ui/Alert";
import { notFound } from "next/navigation";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewArticlePage({
  params,
}: PreviewPageProps) {
  const { id } = await params;
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return <Alert type="error" message="Not authenticated" />;
  }

  try {
    const api = createArticlesApi(accessToken);
    const article = await api.getById(id);

    return (
      <article className="mx-auto max-w-3xl py-8">
        <header className="mb-8 border-b border-gray-200 pb-8">
          <div className="mb-4">
            <StatusBadge status={article.status} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">{article.title}</h1>
          {article.excerpt && (
            <p className="mt-4 text-xl text-gray-600">{article.excerpt}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>By {article.author.name}</span>
            {article.coAuthors.length > 0 && (
              <span>
                with {article.coAuthors.map((a) => a.name).join(", ")}
              </span>
            )}
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>
          {(article.categories.length > 0 || article.tags.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
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
        </header>

        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-800">
            {article.content}
          </div>
        </div>
      </article>
    );
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 404) {
      notFound();
    }
    return (
      <Alert
        type="error"
        message="Failed to load article preview. The API server may be unavailable."
      />
    );
  }
}
