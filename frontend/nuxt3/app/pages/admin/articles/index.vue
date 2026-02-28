<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Articles</h1>
      <NuxtLink
        v-if="hasPermission('article.create')"
        to="/admin/articles/create"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + New Article
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4 flex-wrap">
      <input
        v-model="filters.search"
        type="text"
        placeholder="Search articles..."
        class="border border-gray-300 rounded px-3 py-2 flex-1 min-w-[200px]"
      />
      <select
        v-model="filters.status"
        class="border border-gray-300 rounded px-3 py-2"
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="in_review">In Review</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12 text-gray-500">
      Loading articles...
    </div>

    <!-- Error -->
    <div v-else-if="isError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      Failed to load articles.
    </div>

    <!-- Articles table -->
    <div v-else-if="data?.data?.length" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Title</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Author</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Updated</th>
            <th class="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="article in data.data" :key="article.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <NuxtLink
                :to="`/admin/articles/${article.id}`"
                class="text-blue-600 hover:underline font-medium"
              >
                {{ article.title }}
              </NuxtLink>
              <div v-if="article.lock" class="text-xs text-orange-600 mt-1">
                🔒 Locked by {{ article.lock.lockedBy.name }}
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ article.author.name }}
            </td>
            <td class="px-4 py-3">
              <ArticleStatusBadge :status="article.status" />
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">
              {{ formatDate(article.updatedAt) }}
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <NuxtLink
                v-if="canEditArticle(article)"
                :to="`/admin/articles/${article.id}/edit`"
                class="text-sm text-blue-600 hover:underline"
              >
                Edit
              </NuxtLink>
              <button
                v-if="canDeleteArticle(article)"
                class="text-sm text-red-600 hover:underline"
                @click="handleDelete(article.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="data.meta" class="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
        <span class="text-sm text-gray-500">
          Page {{ data.meta.page }} of {{ data.meta.totalPages }} ({{ data.meta.total }} total)
        </span>
        <div class="flex gap-2">
          <button
            :disabled="data.meta.page <= 1"
            class="px-3 py-1 text-sm border rounded disabled:opacity-50"
            @click="filters.page = (filters.page || 1) - 1"
          >
            Previous
          </button>
          <button
            :disabled="data.meta.page >= data.meta.totalPages"
            class="px-3 py-1 text-sm border rounded disabled:opacity-50"
            @click="filters.page = (filters.page || 1) + 1"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 text-gray-500">
      No articles found.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArticleFilters } from '~/types';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
});

const { hasPermission, canEditArticle, canDeleteArticle } = usePermissions();
const deleteArticle = useDeleteArticle();

const filters = reactive<ArticleFilters>({
  search: '',
  status: undefined,
  page: 1,
  limit: 20,
});

const filtersRef = computed(() => ({ ...filters }));
const { data, isLoading, isError } = useArticles(filtersRef);

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to delete this article?')) return;
  await deleteArticle.mutateAsync(id);
}
</script>
