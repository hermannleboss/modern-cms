import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArticle, useDeleteArticle } from '../hooks/useArticles';
import { useForceUnlock } from '../hooks/useArticleLock';
import { useAuth } from '../../auth/hooks/useAuth';
import { hasPermission, canEditArticle } from '../../../shared/utils/permissions';
import { ArticleHistory } from './ArticleHistory';

const STATUS_LABELS = {
  draft: 'Draft',
  in_review: 'In Review',
  published: 'Published',
  archived: 'Archived',
} as const;

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: article, isLoading, error } = useArticle(id!);
  const deleteArticle = useDeleteArticle();
  const forceUnlock = useForceUnlock();

  if (isLoading) return <div className="loading">Loading article...</div>;
  if (error || !article) return <div className="error-message">Article not found</div>;

  const canEdit = canEditArticle(user, article.author.id);
  const canPublish = hasPermission(user, 'article.publish');
  const canArchive = hasPermission(user, 'article.archive');
  const isAdmin = hasPermission(user, 'article.update.any');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteArticle.mutateAsync(article.id);
      navigate('/articles');
    } catch {
      // Error handled by TanStack Query
    }
  };

  const handleForceUnlock = async () => {
    if (!window.confirm('Force unlock this article?')) return;
    try {
      await forceUnlock.mutateAsync(article.id);
    } catch {
      // Error handled by TanStack Query
    }
  };

  return (
    <div className="article-detail-page">
      <div className="page-header">
        <div>
          <Link to="/articles" className="back-link">← Back to Articles</Link>
          <h1>{article.title}</h1>
        </div>
        <div className="actions">
          {canEdit && (
            <Link to={`/articles/${article.id}/edit`} className="btn btn-primary">
              Edit
            </Link>
          )}
          {canPublish && article.status !== 'published' && (
            <span className="badge badge-info">Can Publish</span>
          )}
          {canArchive && article.status !== 'archived' && (
            <button onClick={handleDelete} className="btn btn-danger">
              Archive
            </button>
          )}
        </div>
      </div>

      <div className="article-info">
        <span className={`status-badge status-${article.status}`}>
          {STATUS_LABELS[article.status]}
        </span>
        <span>By {article.author.name}</span>
        <span>Created: {new Date(article.createdAt).toLocaleDateString()}</span>
        {article.publishedAt && (
          <span>Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
        )}
      </div>

      {article.lock && (
        <div className="lock-banner">
          <span>
            🔒 Locked by {article.lock.lockedBy.name} until{' '}
            {new Date(article.lock.expiresAt).toLocaleTimeString()}
          </span>
          {isAdmin && (
            <button onClick={handleForceUnlock} className="btn btn-sm btn-warning">
              Force Unlock
            </button>
          )}
        </div>
      )}

      {article.excerpt && (
        <div className="article-excerpt-block">
          <h3>Excerpt</h3>
          <p>{article.excerpt}</p>
        </div>
      )}

      <div className="article-content">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {article.coAuthors.length > 0 && (
        <div className="co-authors">
          <h3>Co-Authors</h3>
          <ul>
            {article.coAuthors.map((author) => (
              <li key={author.id}>{author.name}</li>
            ))}
          </ul>
        </div>
      )}

      {article.tags.length > 0 && (
        <div className="article-tags">
          <h3>Tags</h3>
          <div className="tag-list">
            {article.tags.map((tag) => (
              <span key={tag.id} className="tag">{tag.name}</span>
            ))}
          </div>
        </div>
      )}

      {article.categories.length > 0 && (
        <div className="article-categories">
          <h3>Categories</h3>
          <div className="category-list">
            {article.categories.map((cat) => (
              <span key={cat.id} className="category">{cat.name}</span>
            ))}
          </div>
        </div>
      )}

      <ArticleHistory articleId={article.id} />
    </div>
  );
}
