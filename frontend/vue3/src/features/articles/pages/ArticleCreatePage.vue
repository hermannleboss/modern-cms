<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useArticleMutations } from '../composables/useArticleMutations';
import { extractApiError } from '@/shared/api/api-error';
import { ref } from 'vue';
import ArticleForm from '../components/ArticleForm.vue';
import type { CreateArticlePayload } from '../types/article.model';

const router = useRouter();
const { createArticle, isCreating } = useArticleMutations();
const errorMessage = ref('');

async function handleSubmit(payload: CreateArticlePayload) {
  errorMessage.value = '';
  try {
    const article = await createArticle(payload);
    router.push(`/articles/${article.id}`);
  } catch (err) {
    const apiError = extractApiError(err);
    errorMessage.value = apiError.message;
  }
}

function handleCancel() {
  router.push('/articles');
}
</script>

<template>
  <div class="create-page">
    <div class="page-header">
      <h2 class="page-title">Create Article</h2>
    </div>

    <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

    <div class="form-card">
      <ArticleForm
        :is-submitting="isCreating"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<style scoped>
.create-page {
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
