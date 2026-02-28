import { useArticleHistory } from '../hooks/useArticles';

interface ArticleHistoryProps {
  articleId: string;
}

export function ArticleHistory({ articleId }: ArticleHistoryProps) {
  const { data: history, isLoading } = useArticleHistory(articleId);

  if (isLoading) return <div className="loading">Loading history...</div>;
  if (!history || history.length === 0) return null;

  return (
    <div className="article-history">
      <h3>Edit History</h3>
      <ul className="history-list">
        {history.map((entry) => (
          <li key={entry.id} className="history-entry">
            <span className="history-action">{entry.action}</span>
            <span className="history-user">by {entry.userName}</span>
            <span className="history-date">
              {new Date(entry.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
