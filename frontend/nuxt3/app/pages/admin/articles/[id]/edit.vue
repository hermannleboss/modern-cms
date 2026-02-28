<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Edit Article</h1>
      <NuxtLink :to="`/admin/articles/${id}`" class="text-gray-600 hover:text-gray-900">
        ← Back to article
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="text-center py-12 text-gray-500">
      Loading article...
    </div>

    <div v-else-if="isError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      Failed to load article.
    </div>

    <template v-else-if="article">
      <!-- Lock warning -->
      <div
        v-if="lockInfo && !isCurrentUserLock"
        class="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded mb-4"
      >
        🔒 This article is locked by {{ lockInfo.lockedBy.name }}. You cannot edit it right now.
      </div>

      <ArticleForm
        v-if="!lockInfo || isCurrentUserLock"
        :initial-data="article"
        :is-submitting="updateArticle.isPending.value"
        :error="updateArticle.error.value"
        @submit="handleSubmit"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UpdateArticlePayload } from '~/types';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
});

const route = useRoute();
const id = route.params.id as string;

const { data: article, isLoading, isError } = useArticle(id);
const { lock: lockInfo, acquireLock, releaseLock } = useArticleLock(id);
const { user } = useAuth();
const updateArticle = useUpdateArticle();

const isCurrentUserLock = computed(() => {
  return lockInfo.value?.lockedBy.id === user.value?.id;
});

onMounted(async () => {
  try {
    await acquireLock();
  } catch {
    // Lock acquisition failed — UI will show the warning
  }
});

onBeforeUnmount(async () => {
  if (isCurrentUserLock.value) {
    try {
      await releaseLock();
    } catch {
      // Best effort release
    }
  }
});

async function handleSubmit(payload: UpdateArticlePayload) {
  await updateArticle.mutateAsync({ id, payload });
  navigateTo(`/admin/articles/${id}`);
}
</script>
