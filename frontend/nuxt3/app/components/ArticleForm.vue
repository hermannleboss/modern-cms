<template>
  <form class="bg-white rounded-lg shadow-sm p-6 space-y-6" @submit.prevent="handleSubmit">
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {{ getErrorMessage(error) }}
    </div>

    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        required
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Article title"
      />
    </div>

    <!-- Excerpt -->
    <div>
      <label for="excerpt" class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
      <textarea
        id="excerpt"
        v-model="form.excerpt"
        rows="2"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Brief description..."
      />
    </div>

    <!-- Content -->
    <div>
      <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content *</label>
      <textarea
        id="content"
        v-model="form.content"
        rows="15"
        required
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        placeholder="Write your article content..."
      />
    </div>

    <!-- Status -->
    <div>
      <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
      <select
        id="status"
        v-model="form.status"
        class="border border-gray-300 rounded px-3 py-2"
      >
        <option value="draft">Draft</option>
        <option v-if="hasPermission('article.publish')" value="in_review">In Review</option>
        <option v-if="hasPermission('article.publish')" value="published">Published</option>
        <option v-if="hasPermission('article.archive')" value="archived">Archived</option>
      </select>
    </div>

    <!-- Tags -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
      <div v-if="tagsLoading" class="text-sm text-gray-400">Loading tags...</div>
      <div v-else class="flex flex-wrap gap-2">
        <label
          v-for="tag in availableTags"
          :key="tag.id"
          class="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
        >
          <input
            v-model="form.tagIds"
            type="checkbox"
            :value="tag.id"
          />
          {{ tag.name }}
        </label>
      </div>
    </div>

    <!-- Categories -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Categories</label>
      <div v-if="categoriesLoading" class="text-sm text-gray-400">Loading categories...</div>
      <div v-else class="flex flex-wrap gap-2">
        <label
          v-for="category in availableCategories"
          :key="category.id"
          class="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
        >
          <input
            v-model="form.categoryIds"
            type="checkbox"
            :value="category.id"
          />
          {{ category.name }}
        </label>
      </div>
    </div>

    <!-- Submit -->
    <div class="flex justify-end gap-3">
      <NuxtLink
        to="/admin/articles"
        class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </NuxtLink>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Create') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Article, CreateArticlePayload, UpdateArticlePayload } from '~/types';

const props = defineProps<{
  initialData?: Article;
  isSubmitting: boolean;
  error: Error | null;
}>();

const emit = defineEmits<{
  submit: [payload: CreateArticlePayload | UpdateArticlePayload];
}>();

const { hasPermission } = usePermissions();
const { data: availableTags, isLoading: tagsLoading } = useTags();
const { data: availableCategories, isLoading: categoriesLoading } = useCategories();

const form = reactive({
  title: props.initialData?.title || '',
  content: props.initialData?.content || '',
  excerpt: props.initialData?.excerpt || '',
  status: props.initialData?.status || 'draft',
  tagIds: props.initialData?.tags?.map((t) => t.id) || [] as string[],
  categoryIds: props.initialData?.categories?.map((c) => c.id) || [] as string[],
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An error occurred';
}

function handleSubmit() {
  emit('submit', {
    title: form.title,
    content: form.content,
    excerpt: form.excerpt || undefined,
    status: form.status as 'draft' | 'in_review' | 'published' | 'archived',
    tagIds: form.tagIds,
    categoryIds: form.categoryIds,
  });
}
</script>
