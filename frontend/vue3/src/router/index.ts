import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/pages/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      redirect: '/articles',
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/features/articles/pages/ArticlesPage.vue'),
      meta: { permission: 'article.read' },
    },
    {
      path: '/articles/create',
      name: 'article-create',
      component: () => import('@/features/articles/pages/ArticleCreatePage.vue'),
      meta: { permission: 'article.create' },
    },
    {
      path: '/articles/:id',
      name: 'article-detail',
      component: () => import('@/features/articles/pages/ArticleDetailPage.vue'),
      meta: { permission: 'article.read' },
    },
    {
      path: '/articles/:id/edit',
      name: 'article-edit',
      component: () => import('@/features/articles/pages/ArticleEditPage.vue'),
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/features/categories/pages/CategoriesPage.vue'),
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('@/features/tags/pages/TagsPage.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/features/users/pages/UsersPage.vue'),
      meta: { permission: 'user.read' },
    },
  ],
});

router.beforeEach(authGuard);

export default router;
