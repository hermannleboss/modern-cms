import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { hasPermission } from '../utils/permissions';

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Modern CMS</h2>
        </div>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/articles">Articles</NavLink>
          </li>
          <li>
            <NavLink to="/tags">Tags</NavLink>
          </li>
          <li>
            <NavLink to="/categories">Categories</NavLink>
          </li>
          {hasPermission(user, 'user.read') && (
            <li>
              <NavLink to="/users">Users</NavLink>
            </li>
          )}
        </ul>
        <div className="sidebar-footer">
          <div className="user-profile">
            <span>{user?.name}</span>
            <small>{user?.email}</small>
          </div>
          <button onClick={logout} className="btn btn-sm btn-secondary">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
