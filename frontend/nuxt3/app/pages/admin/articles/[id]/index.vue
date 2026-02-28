<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <NuxtLink to="/admin/articles" class="text-gray-600 hover:text-gray-900">
        ← Back to articles
      </NuxtLink>
      <div class="flex gap-2">
        <NuxtLink
          v-if="article && canEditArticle(article)"
          :to="`/admin/articles/${id}/edit`"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Edit
        </NuxtLink>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12 text-gray-500">
      Loading article...
    </div>

    <div v-else-if="isError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      Failed to load article.
    </div>

    <template v-else-if="article">
      <!-- Lock indicator -->
      <div
        v-if="article.lock"
        class="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded mb-4 flex items-center justify-between"
      >
        <span>🔒 Locked by {{ article.lock.lockedBy.name }} until {{ formatDate(article.lock.expiresAt) }}</span>
        <button
          v-if="hasPermission('lock.force_unlock')"
          class="text-sm underline hover:no-underline"
          @click="handleForceUnlock"
        >
          Force Unlock
        </button>
      </div>

      <!-- Article content -->
      <article class="bg-white rounded-lg shadow-sm p-8">
        <div class="flex items-center gap-3 mb-4">
          <ArticleStatusBadge :status="article.status" />
          <span class="text-sm text-gray-500">
            by {{ article.author.name }}
          </span>
          <span v-if="article.publishedAt" class="text-sm text-gray-500">
            · Published {{ formatDate(article.publishedAt) }}
          </span>
        </div>

        <h1 class="text-3xl font-bold mb-4">{{ article.title }}</h1>

        <div v-if="article.excerpt" class="text-lg text-gray-600 mb-6 italic border-l-4 border-gray-300 pl-4">
          {{ article.excerpt }}
        </div>

        <div class="prose max-w-none" v-html="sanitizedContent" />

        <!-- Co-authors -->
        <div v-if="article.coAuthors.length" class="mt-8 pt-4 border-t">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Co-authors</h3>
          <div class="flex gap-2">
            <span
              v-for="coAuthor in article.coAuthors"
              :key="coAuthor.id"
              class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
            >
              {{ coAuthor.name }}
            </span>
          </div>
        </div>

        <!-- Tags & Categories -->
        <div class="mt-4 flex gap-4 flex-wrap">
          <div v-if="article.categories.length" class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Categories:</span>
            <span
              v-for="cat in article.categories"
              :key="cat.id"
              class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs"
            >
              {{ cat.name }}
            </span>
          </div>
          <div v-if="article.tags.length" class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Tags:</span>
            <span
              v-for="tag in article.tags"
              :key="tag.id"
              class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Status Actions -->
        <div v-if="article && canEditArticle(article)" class="mt-8 pt-4 border-t flex gap-2">
          <button
            v-if="article.status === 'draft' && hasPermission('article.publish')"
            class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
            @click="handleStatusChange('in_review')"
          >
            Submit for Review
          </button>
          <button
            v-if="article.status === 'in_review' && hasPermission('article.publish')"
            class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            @click="handleStatusChange('published')"
          >
            Publish
          </button>
          <button
            v-if="article.status === 'published' && hasPermission('article.archive')"
            class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            @click="handleStatusChange('archived')"
          >
            Archive
          </button>
          <button
            v-if="article.status === 'archived' && hasPermission('article.publish')"
            class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            @click="handleStatusChange('draft')"
          >
            Revert to Draft
          </button>
        </div>
      </article>

      <!-- History -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold mb-4">Edit History</h2>
        <div v-if="isHistoryLoading" class="text-gray-500">Loading history...</div>
        <div v-else-if="history?.length" class="space-y-2">
          <div
            v-for="entry in history"
            :key="entry.id"
            class="bg-white rounded shadow-sm px-4 py-3 text-sm"
          >
            <span class="font-medium">{{ entry.modifiedBy.name }}</span>
            modified on {{ formatDate(entry.createdAt) }}
          </div>
        </div>
        <div v-else class="text-sm text-gray-500">No history available.</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { sanitizeHtml } from '~/utils/sanitize';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
});

const route = useRoute();
const id = route.params.id as string;

const { data: article, isLoading, isError } = useArticle(id);
const { data: history, isLoading: isHistoryLoading } = useArticleHistory(id);
const { hasPermission, canEditArticle } = usePermissions();
const { forceUnlock } = useArticleLock(id);
const updateStatus = useUpdateArticleStatus();

const sanitizedContent = computed(() => {
  if (!article.value?.content) return '';
  return sanitizeHtml(article.value.content);
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

async function handleStatusChange(status: string) {
  await updateStatus.mutateAsync({ id, status });
}

async function handleForceUnlock() {
  if (!confirm('Are you sure you want to force unlock this article?')) return;
  await forceUnlock();
}
</script>
