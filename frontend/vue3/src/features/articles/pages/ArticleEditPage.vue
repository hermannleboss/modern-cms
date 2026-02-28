<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useArticle } from '../composables/useArticles';
import { useArticleMutations } from '../composables/useArticleMutations';
import { useArticleLock } from '../composables/useArticleLock';
import { extractApiError } from '@/shared/api/api-error';
import ArticleForm from '../components/ArticleForm.vue';
import ArticleLockBanner from '../components/ArticleLockBanner.vue';
import type { CreateArticlePayload } from '../types/article.model';

const route = useRoute();
const router = useRouter();
const articleId = route.params.id as string;

const { article, isLoading } = useArticle(articleId);
const { updateArticle, isUpdating } = useArticleMutations();
const {
  isLocked,
  isLockedByMe,
  isLockedByOther,
  canForceUnlock,
  acquireLock,
  releaseLock,
  forceUnlock,
  isForcingUnlock,
} = useArticleLock(() => article.value);

const errorMessage = ref('');

// Acquire lock on mount
acquireLock(articleId).catch(() => {
  // Lock acquisition may fail if already locked by another user
});

// Release lock on unmount
onUnmounted(() => {
  if (isLockedByMe.value) {
    releaseLock(articleId).catch(() => {
      // Best-effort release
    });
  }
});

async function handleSubmit(payload: CreateArticlePayload) {
  errorMessage.value = '';
  try {
    await updateArticle({ id: articleId, payload });
    router.push(`/articles/${articleId}`);
  } catch (err) {
    const apiError = extractApiError(err);
    errorMessage.value = apiError.message;
  }
}

async function handleForceUnlock() {
  try {
    await forceUnlock(articleId);
    await acquireLock(articleId);
  } catch (err) {
    const apiError = extractApiError(err);
    errorMessage.value = apiError.message;
  }
}

function handleCancel() {
  router.push(`/articles/${articleId}`);
}
</script>

<template>
  <div class="edit-page">
    <div class="page-header">
      <h2 class="page-title">Edit Article</h2>
    </div>

    <div v-if="isLoading" class="loading">Loading article...</div>

    <template v-else-if="article">
      <ArticleLockBanner
        v-if="isLocked && article.lock"
        :lock="article.lock"
        :is-locked-by-me="isLockedByMe"
        :can-force-unlock="canForceUnlock"
        :is-forcing-unlock="isForcingUnlock"
        @force-unlock="handleForceUnlock"
      />

      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <div class="form-card">
        <ArticleForm
          :article="article"
          :is-submitting="isUpdating"
          :disabled="isLockedByOther"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.edit-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: #111827;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.error-banner {
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}
</style>
