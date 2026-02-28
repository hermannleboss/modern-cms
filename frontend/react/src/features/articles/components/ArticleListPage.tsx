import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useAuth } from '../../auth/hooks/useAuth';
import { hasPermission } from '../../../shared/utils/permissions';
import type { ArticleStatus, ArticleFilters } from '../types';

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_COLORS: Record<ArticleStatus, string> = {
  draft: '#6c757d',
  in_review: '#ffc107',
  published: '#28a745',
  archived: '#dc3545',
};

export function ArticleListPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ArticleFilters>({ page: 1, perPage: 10 });
  const { data, isLoading, error } = useArticles(filters);

  const handleStatusFilter = (status: ArticleStatus | '') => {
    setFilters((prev) => ({
      ...prev,
      status: status || undefined,
      page: 1,
    }));
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  };

  if (isLoading) return <div className="loading">Loading articles...</div>;
  if (error) return <div className="error-message">Failed to load articles</div>;

  return (
    <div className="article-list-page">
      <div className="page-header">
        <h1>Articles</h1>
        {hasPermission(user, 'article.create') && (
          <Link to="/articles/new" className="btn btn-primary">
            New Article
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search articles..."
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filters.status ?? ''}
          onChange={(e) => handleStatusFilter(e.target.value as ArticleStatus | '')}
          className="status-filter"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="article-list">
        {data?.data.length === 0 && <p className="empty-state">No articles found.</p>}
        {data?.data.map((article) => (
          <div key={article.id} className="article-card">
            <div className="article-card-header">
              <Link to={`/articles/${article.id}`} className="article-title">
                {article.title}
              </Link>
              <span
                className="status-badge"
                style={{ backgroundColor: STATUS_COLORS[article.status] }}
              >
                {STATUS_LABELS[article.status]}
              </span>
            </div>
            <p className="article-excerpt">{article.excerpt}</p>
            <div className="article-meta">
              <span>By {article.author.name}</span>
              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              {article.lock && (
                <span className="lock-indicator">
                  🔒 Locked by {article.lock.lockedBy.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {data?.meta && data.meta.lastPage > 1 && (
        <div className="pagination">
          <button
            disabled={data.meta.page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
          >
            Previous
          </button>
          <span>
            Page {data.meta.page} of {data.meta.lastPage}
          </span>
          <button
            disabled={data.meta.page >= data.meta.lastPage}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
