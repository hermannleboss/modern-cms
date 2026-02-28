import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useArticle, useCreateArticle, useUpdateArticle } from '../hooks/useArticles';
import { useAcquireLock, useReleaseLock } from '../hooks/useArticleLock';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTags } from '../../tags/hooks/useTags';
import { useCategories } from '../../categories/hooks/useCategories';
import { hasPermission, canEditArticle } from '../../../shared/utils/permissions';
import type { ArticleFormData, ArticleStatus } from '../types';

export function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const { data: existingArticle, isLoading: isLoadingArticle } = useArticle(id ?? '');
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const acquireLock = useAcquireLock();
  const releaseLock = useReleaseLock();
  const { data: tagsData } = useTags();
  const { data: categoriesData } = useCategories();

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    tagIds: [],
    categoryIds: [],
    coAuthorIds: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [lockAcquired, setLockAcquired] = useState(false);

  useEffect(() => {
    if (existingArticle && isEditMode) {
      setFormData({
        title: existingArticle.title,
        content: existingArticle.content,
        excerpt: existingArticle.excerpt,
        status: existingArticle.status,
        tagIds: existingArticle.tags.map((t) => t.id),
        categoryIds: existingArticle.categories.map((c) => c.id),
        coAuthorIds: existingArticle.coAuthors.map((a) => a.id),
      });
    }
  }, [existingArticle, isEditMode]);

  useEffect(() => {
    if (isEditMode && id && !lockAcquired) {
      acquireLock.mutate(id, {
        onSuccess: () => setLockAcquired(true),
        onError: () => setError('Could not acquire lock. Article may be edited by another user.'),
      });
    }

    return () => {
      if (isEditMode && id && lockAcquired) {
        releaseLock.mutate(id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id]);

  if (isEditMode && isLoadingArticle) {
    return <div className="loading">Loading article...</div>;
  }

  if (isEditMode && existingArticle && !canEditArticle(user, existingArticle.author.id)) {
    return <div className="error-message">You do not have permission to edit this article.</div>;
  }

  if (!isEditMode && !hasPermission(user, 'article.create')) {
    return <div className="error-message">You do not have permission to create articles.</div>;
  }

  const availableStatuses: ArticleStatus[] = (() => {
    const statuses: ArticleStatus[] = ['draft'];
    statuses.push('in_review');
    if (hasPermission(user, 'article.publish')) statuses.push('published');
    if (hasPermission(user, 'article.archive')) statuses.push('archived');
    return statuses;
  })();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isEditMode && id) {
        await updateArticle.mutateAsync({ id, formData });
      } else {
        await createArticle.mutateAsync(formData);
      }
      navigate('/articles');
    } catch {
      setError('Failed to save article. Please try again.');
    }
  };

  const handleFieldChange = <K extends keyof ArticleFormData>(
    field: K,
    value: ArticleFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  return (
    <div className="article-editor-page">
      <h1>{isEditMode ? 'Edit Article' : 'Create Article'}</h1>

      {error && <div className="error-message">{error}</div>}

      {isEditMode && !lockAcquired && (
        <div className="warning-message">
          Unable to acquire editing lock. Changes may not be saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="article-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => handleFieldChange('excerpt', e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleFieldChange('content', e.target.value)}
            rows={15}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleFieldChange('status', e.target.value as ArticleStatus)}
          >
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="checkbox-group">
            {tagsData?.data.map((tag) => (
              <label key={tag.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.tagIds.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Categories</label>
          <div className="checkbox-group">
            {categoriesData?.data.map((cat) => (
              <label key={cat.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.categoryIds.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createArticle.isPending || updateArticle.isPending}
          >
            {createArticle.isPending || updateArticle.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
