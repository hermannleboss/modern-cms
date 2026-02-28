"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import type {
  CreateArticleDTO,
  Article,
  Category,
  Tag,
} from "@/types";

interface ArticleFormProps {
  article?: Article;
  categories: Category[];
  tags: Tag[];
  onSubmit: (data: CreateArticleDTO) => void;
  isLoading: boolean;
  submitLabel: string;
}

export function ArticleForm({
  article,
  categories,
  tags,
  onSubmit,
  isLoading,
  submitLabel,
}: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    article?.categories.map((c) => c.id) ?? [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags.map((t) => t.id) ?? [],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      excerpt,
      categoryIds: selectedCategories,
      tagIds: selectedTags,
      coAuthorIds: [],
    });
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Article title"
      />

      <TextArea
        label="Excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Brief summary of the article"
        rows={3}
      />

      <TextArea
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        placeholder="Write your article content..."
        rows={12}
      />

      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCategories.includes(category.id)
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTags.includes(tag.id)
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
