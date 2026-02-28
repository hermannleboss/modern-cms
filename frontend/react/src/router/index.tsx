import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { AppLayout } from '../shared/components/AppLayout';
import { DashboardPage } from '../shared/components/DashboardPage';
import { LoginPage } from '../features/auth/components/LoginPage';
import { ArticleListPage } from '../features/articles/components/ArticleListPage';
import { ArticleDetailPage } from '../features/articles/components/ArticleDetailPage';
import { ArticleEditorPage } from '../features/articles/components/ArticleEditorPage';
import { TagListPage } from '../features/tags/components/TagListPage';
import { CategoryListPage } from '../features/categories/components/CategoryListPage';
import { UserListPage } from '../features/users/components/UserListPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'articles', element: <ArticleListPage /> },
      { path: 'articles/new', element: <ArticleEditorPage /> },
      { path: 'articles/:id', element: <ArticleDetailPage /> },
      { path: 'articles/:id/edit', element: <ArticleEditorPage /> },
      { path: 'tags', element: <TagListPage /> },
      { path: 'categories', element: <CategoryListPage /> },
      { path: 'users', element: <UserListPage /> },
    ],
  },
]);
