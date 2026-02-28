import { useAuth } from '../../features/auth/hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Articles</h3>
          <p>Manage your blog articles, drafts, and publications.</p>
        </div>
        <div className="dashboard-card">
          <h3>Tags & Categories</h3>
          <p>Organize your content with tags and hierarchical categories.</p>
        </div>
        <div className="dashboard-card">
          <h3>Collaboration</h3>
          <p>Work with your team using collaborative editing with article locks.</p>
        </div>
      </div>
    </div>
  );
}
