<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Create Article</h1>
      <NuxtLink to="/admin/articles" class="text-gray-600 hover:text-gray-900">
        ← Back to articles
      </NuxtLink>
    </div>

    <ArticleForm
      :is-submitting="createArticle.isPending.value"
      :error="createArticle.error.value"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import type { CreateArticlePayload } from '~/types';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  permission: 'article.create',
});

const createArticle = useCreateArticle();

async function handleSubmit(payload: CreateArticlePayload) {
  await createArticle.mutateAsync(payload);
  navigateTo('/admin/articles');
}
</script>
