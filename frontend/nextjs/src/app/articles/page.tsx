import { Suspense } from "react";
import { ArticleList } from "@/components/articles/ArticleList";

export const metadata = {
  title: "Articles - Modern CMS",
};

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <ArticleList />
    </Suspense>
  );
}
