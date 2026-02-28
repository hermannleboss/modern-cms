<script setup lang="ts">
import { ref } from 'vue';
import { useTags } from '../composables/useTags';
import { extractApiError } from '@/shared/api/api-error';
import PermissionGuard from '@/shared/components/PermissionGuard.vue';
import type { Tag } from '../types/tag.model';

const { tags, isLoading, createTag, updateTag, deleteTag, isCreating } = useTags();

const showForm = ref(false);
const editingTag = ref<Tag | null>(null);
const formName = ref('');
const errorMessage = ref('');

function openCreate() {
  editingTag.value = null;
  formName.value = '';
  showForm.value = true;
}

function openEdit(tag: Tag) {
  editingTag.value = tag;
  formName.value = tag.name;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingTag.value = null;
  errorMessage.value = '';
}

async function handleSubmit() {
  errorMessage.value = '';
  try {
    if (editingTag.value) {
      await updateTag({
        id: editingTag.value.id,
        payload: { name: formName.value },
      });
    } else {
      await createTag({ name: formName.value });
    }
    closeForm();
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}

async function handleDelete(tag: Tag) {
  if (!confirm(`Delete tag "${tag.name}"?`)) return;
  try {
    await deleteTag(tag.id);
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}


</script>

<template>
  <div class="tags-page">
    <div class="page-header">
      <h2 class="page-title">Tags</h2>
      <PermissionGuard permission="tag.create">
        <button class="btn-primary" @click="openCreate">+ New Tag</button>
      </PermissionGuard>
    </div>

    <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

    <div v-if="showForm" class="form-card">
      <h3>{{ editingTag ? 'Edit Tag' : 'New Tag' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="tag-name">Name</label>
          <input id="tag-name" v-model="formName" type="text" required />
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeForm">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isCreating">Save</button>
        </div>
      </form>
    </div>

    <div v-if="isLoading" class="loading">Loading tags...</div>
    <div v-else-if="tags.length === 0" class="empty-state">No tags yet.</div>
    <div v-else class="tags-grid">
      <div v-for="tag in tags" :key="tag.id" class="tag-card">
        <div class="tag-info">
          <strong>{{ tag.name }}</strong>
          <span class="tag-slug">{{ tag.slug }}</span>
        </div>
        <div class="tag-actions">
          <PermissionGuard permission="tag.update">
            <button class="btn-sm" @click="openEdit(tag)">Edit</button>
          </PermissionGuard>
          <PermissionGuard permission="tag.delete">
            <button class="btn-sm btn-sm-danger" @click="handleDelete(tag)">Delete</button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tags-page {
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  margin-bottom: 1rem;
}

.form-card h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.loading,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.tags-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tag-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.tag-slug {
  margin-left: 0.5rem;
  color: #9ca3af;
  font-size: 0.85rem;
}

.tag-actions {
  display: flex;
  gap: 0.375rem;
}

.btn-primary {
  padding: 0.5rem 1rem;
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
  padding: 0.5rem 1rem;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-sm {
  padding: 0.25rem 0.625rem;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-sm:hover {
  background: #f3f4f6;
}

.btn-sm-danger {
  color: #dc2626;
  border-color: #fecaca;
}

.btn-sm-danger:hover {
  background: #fee2e2;
}
</style>
