<script setup lang="ts">
import type { Article } from '../types/article.model';
import ArticleStatusBadge from './ArticleStatusBadge.vue';
import { formatRelativeDate } from '@/shared/utils/date';

defineProps<{
  articles: Article[];
  isLoading: boolean;
}>();

defineEmits<{
  select: [article: Article];
}>();
</script>

<template>
  <div class="article-list">
    <div v-if="isLoading" class="loading">Loading articles...</div>
    <div v-else-if="articles.length === 0" class="empty-state">
      No articles found. Create your first article!
    </div>
    <div
      v-for="article in articles"
      v-else
      :key="article.id"
      class="article-card"
      @click="$emit('select', article)"
    >
      <div class="article-header">
        <h3 class="article-title">{{ article.title }}</h3>
        <ArticleStatusBadge :status="article.status" />
      </div>
      <p v-if="article.excerpt" class="article-excerpt">{{ article.excerpt }}</p>
      <div class="article-meta">
        <span>By {{ article.author.name }}</span>
        <span v-if="article.coAuthors.length > 0">
          + {{ article.coAuthors.length }} co-author{{ article.coAuthors.length > 1 ? 's' : '' }}
        </span>
        <span class="meta-separator">•</span>
        <span>{{ formatRelativeDate(article.updatedAt) }}</span>
        <span v-if="article.lock" class="lock-indicator">🔒</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1rem;
}

.article-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.article-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.375rem;
}

.article-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
}

.article-excerpt {
  margin: 0 0 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

.meta-separator {
  margin: 0 0.125rem;
}

.lock-indicator {
  margin-left: 0.25rem;
}
</style>
