<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useArticles } from '../composables/useArticles';
import { usePermissions } from '@/shared/composables/usePermissions';
import ArticleList from '../components/ArticleList.vue';
import PermissionGuard from '@/shared/components/PermissionGuard.vue';
import type { Article } from '../types/article.model';

const router = useRouter();
const { can } = usePermissions();

const filters = reactive({
  page: 1,
  limit: 10,
  status: undefined as string | undefined,
  search: undefined as string | undefined,
});

const { articles, meta, isLoading } = useArticles(filters);

function onSelectArticle(article: Article) {
  if (can('article.read')) {
    router.push(`/articles/${article.id}`);
  }
}

function onCreateArticle() {
  router.push('/articles/create');
}

function onFilterStatus(status: string | undefined) {
  filters.status = status;
  filters.page = 1;
}
</script>

<template>
  <div class="articles-page">
    <div class="page-header">
      <h2 class="page-title">Articles</h2>
      <PermissionGuard permission="article.create">
        <button class="btn-primary" @click="onCreateArticle">+ New Article</button>
      </PermissionGuard>
    </div>

    <div class="filters">
      <button
        class="filter-btn"
        :class="{ active: !filters.status }"
        @click="onFilterStatus(undefined)"
      >
        All
      </button>
      <button
        class="filter-btn"
        :class="{ active: filters.status === 'draft' }"
        @click="onFilterStatus('draft')"
      >
        Drafts
      </button>
      <button
        class="filter-btn"
        :class="{ active: filters.status === 'in_review' }"
        @click="onFilterStatus('in_review')"
      >
        In Review
      </button>
      <button
        class="filter-btn"
        :class="{ active: filters.status === 'published' }"
        @click="onFilterStatus('published')"
      >
        Published
      </button>
      <button
        class="filter-btn"
        :class="{ active: filters.status === 'archived' }"
        @click="onFilterStatus('archived')"
      >
        Archived
      </button>
    </div>

    <ArticleList
      :articles="articles"
      :is-loading="isLoading"
      @select="onSelectArticle"
    />

    <div v-if="meta && meta.totalPages > 1" class="pagination">
      <button :disabled="filters.page <= 1" @click="filters.page--">Previous</button>
      <span>Page {{ filters.page }} of {{ meta.totalPages }}</span>
      <button :disabled="filters.page >= meta.totalPages" @click="filters.page++">Next</button>
    </div>
  </div>
</template>

<style scoped>
.articles-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: #111827;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.375rem 0.875rem;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
  color: #374151;
}

.filter-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.filter-btn:hover:not(.active) {
  background: #f3f4f6;
}

.btn-primary {
  padding: 0.5rem 1.25rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  background: #2563eb;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.pagination button {
  padding: 0.375rem 0.75rem;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
