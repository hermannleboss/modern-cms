<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useArticle } from '../composables/useArticles';
import { useArticleMutations } from '../composables/useArticleMutations';
import { useArticleLock } from '../composables/useArticleLock';
import { usePermissions } from '@/shared/composables/usePermissions';
import { useAuth } from '@/features/auth/composables/useAuth';
import { extractApiError } from '@/shared/api/api-error';
import { ref } from 'vue';
import ArticleStatusBadge from '../components/ArticleStatusBadge.vue';
import ArticleLockBanner from '../components/ArticleLockBanner.vue';
import ArticleHistoryPanel from '../components/ArticleHistoryPanel.vue';
import PermissionGuard from '@/shared/components/PermissionGuard.vue';
import { formatDate } from '@/shared/utils/date';

const route = useRoute();
const router = useRouter();
const articleId = route.params.id as string;

const { article, isLoading } = useArticle(articleId);
const { publishArticle, archiveArticle, submitForReview, deleteArticle, isPublishing, isArchiving, isSubmittingForReview } = useArticleMutations();
const { isLocked, isLockedByMe, canForceUnlock, forceUnlock, isForcingUnlock } = useArticleLock(() => article.value);
const { can } = usePermissions();
const { user } = useAuth();

const errorMessage = ref('');

function canEditArticle(): boolean {
  if (!article.value || !user.value) return false;
  if (can('article.update.any')) return true;
  if (can('article.update.own') && article.value.author.id === user.value.id) return true;
  return false;
}

function onEdit() {
  router.push(`/articles/${articleId}/edit`);
}

async function onPublish() {
  try {
    await publishArticle(articleId);
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}

async function onArchive() {
  try {
    await archiveArticle(articleId);
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}

async function onSubmitForReview() {
  try {
    await submitForReview(articleId);
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}

async function onDelete() {
  if (!confirm('Are you sure you want to delete this article?')) return;
  try {
    await deleteArticle(articleId);
    router.push('/articles');
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}

async function handleForceUnlock() {
  try {
    await forceUnlock(articleId);
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}
</script>

<template>
  <div class="detail-page">
    <div v-if="isLoading" class="loading">Loading article...</div>

    <template v-else-if="article">
      <div class="page-header">
        <div class="header-left">
          <button class="btn-back" @click="router.push('/articles')">← Back</button>
          <h2 class="page-title">{{ article.title }}</h2>
          <ArticleStatusBadge :status="article.status" />
        </div>
        <div class="header-actions">
          <button
            v-if="canEditArticle()"
            class="btn-secondary"
            @click="onEdit"
          >
            Edit
          </button>

          <PermissionGuard permission="article.publish">
            <button
              v-if="article.status === 'in_review'"
              class="btn-primary"
              :disabled="isPublishing"
              @click="onPublish"
            >
              {{ isPublishing ? 'Publishing...' : 'Publish' }}
            </button>
          </PermissionGuard>

          <button
            v-if="canEditArticle() && article.status === 'draft'"
            class="btn-secondary"
            :disabled="isSubmittingForReview"
            @click="onSubmitForReview"
          >
            {{ isSubmittingForReview ? 'Submitting...' : 'Submit for Review' }}
          </button>

          <PermissionGuard permission="article.archive">
            <button
              v-if="article.status === 'published'"
              class="btn-warning"
              :disabled="isArchiving"
              @click="onArchive"
            >
              {{ isArchiving ? 'Archiving...' : 'Archive' }}
            </button>
          </PermissionGuard>

          <PermissionGuard permission="article.delete">
            <button class="btn-danger" @click="onDelete">Delete</button>
          </PermissionGuard>
        </div>
      </div>

      <ArticleLockBanner
        v-if="isLocked && article.lock"
        :lock="article.lock"
        :is-locked-by-me="isLockedByMe"
        :can-force-unlock="canForceUnlock"
        :is-forcing-unlock="isForcingUnlock"
        @force-unlock="handleForceUnlock"
      />

      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <div class="article-content-card">
        <div class="article-meta">
          <span>By <strong>{{ article.author.name }}</strong></span>
          <span v-if="article.coAuthors.length > 0">
            · Co-authors:
            <span v-for="(coAuthor, idx) in article.coAuthors" :key="coAuthor.id">
              {{ coAuthor.name }}{{ idx < article.coAuthors.length - 1 ? ', ' : '' }}
            </span>
          </span>
          <span>· Created {{ formatDate(article.createdAt) }}</span>
          <span v-if="article.publishedAt">· Published {{ formatDate(article.publishedAt) }}</span>
        </div>

        <p v-if="article.excerpt" class="article-excerpt">{{ article.excerpt }}</p>

        <div class="article-body">{{ article.content }}</div>

        <div v-if="article.tags.length > 0" class="article-tags">
          <span v-for="tag in article.tags" :key="tag" class="tag-chip">{{ tag }}</span>
        </div>
      </div>

      <ArticleHistoryPanel
        v-if="article.history.length > 0"
        :history="article.history"
        class="history-section"
      />
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-back {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.btn-back:hover {
  color: #111827;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.error-banner {
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.article-content-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.article-meta {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.article-excerpt {
  font-size: 1.05rem;
  color: #374151;
  font-style: italic;
  border-left: 3px solid #3b82f6;
  padding-left: 1rem;
  margin: 0 0 1rem;
}

.article-body {
  font-size: 1rem;
  line-height: 1.7;
  color: #111827;
  white-space: pre-wrap;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.tag-chip {
  padding: 0.25rem 0.75rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 9999px;
  font-size: 0.8rem;
  color: #1d4ed8;
}

.history-section {
  margin-top: 1rem;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-warning {
  padding: 0.5rem 1rem;
  background: #f59e0b;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-danger {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>
