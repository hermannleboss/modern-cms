<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Article, CreateArticlePayload } from '../types/article.model';
import { useCategories } from '@/features/categories/composables/useCategories';
import { useTags } from '@/features/tags/composables/useTags';

const props = defineProps<{
  article?: Article;
  isSubmitting: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: CreateArticlePayload];
  cancel: [];
}>();

const { categories } = useCategories();
const { tags: availableTags } = useTags();

const title = ref('');
const content = ref('');
const excerpt = ref('');
const categoryId = ref<string | null>(null);
const selectedTags = ref<string[]>([]);

watch(
  () => props.article,
  (article) => {
    if (article) {
      title.value = article.title;
      content.value = article.content;
      excerpt.value = article.excerpt;
      categoryId.value = article.categoryId;
      selectedTags.value = [...article.tags];
    }
  },
  { immediate: true },
);

function handleSubmit() {
  emit('submit', {
    title: title.value,
    content: content.value,
    excerpt: excerpt.value,
    categoryId: categoryId.value,
    tags: selectedTags.value,
  });
}

function toggleTag(tagName: string) {
  const idx = selectedTags.value.indexOf(tagName);
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1);
  } else {
    selectedTags.value.push(tagName);
  }
}
</script>

<template>
  <form class="article-form" @submit.prevent="handleSubmit">
    <fieldset :disabled="disabled">
    <div class="form-group">
      <label for="title">Title</label>
      <input id="title" v-model="title" type="text" required placeholder="Article title" />
    </div>

    <div class="form-group">
      <label for="excerpt">Excerpt</label>
      <textarea id="excerpt" v-model="excerpt" rows="2" placeholder="Short summary" />
    </div>

    <div class="form-group">
      <label for="content">Content</label>
      <textarea id="content" v-model="content" rows="12" required placeholder="Write your article..." />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="category">Category</label>
        <select id="category" v-model="categoryId">
          <option :value="null">No category</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Tags</label>
      <div class="tags-selector">
        <button
          v-for="tag in availableTags"
          :key="tag.id"
          type="button"
          class="tag-chip"
          :class="{ selected: selectedTags.includes(tag.name) }"
          @click="toggleTag(tag.name)"
        >
          {{ tag.name }}
        </button>
        <span v-if="availableTags.length === 0" class="empty-tags">No tags available</span>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary" :disabled="isSubmitting || disabled">
        {{ isSubmitting ? 'Saving...' : (article ? 'Update' : 'Create') }}
      </button>
    </div>
    </fieldset>
  </form>
</template>

<style scoped>
.article-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.tags-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  padding: 0.375rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
}

.tag-chip.selected {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.tag-chip:hover:not(.selected) {
  background: #e5e7eb;
}

.empty-tags {
  color: #9ca3af;
  font-size: 0.85rem;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
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

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1.25rem;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f9fafb;
}
</style>
