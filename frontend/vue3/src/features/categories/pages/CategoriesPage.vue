<script setup lang="ts">
import { ref } from 'vue';
import { useCategories } from '../composables/useCategories';
import { extractApiError } from '@/shared/api/api-error';
import PermissionGuard from '@/shared/components/PermissionGuard.vue';
import type { Category } from '../types/category.model';

const { categories, isLoading, createCategory, updateCategory, deleteCategory, isCreating } = useCategories();

const showForm = ref(false);
const editingCategory = ref<Category | null>(null);
const formName = ref('');
const formParentId = ref<string | null>(null);
const errorMessage = ref('');

function openCreate() {
  editingCategory.value = null;
  formName.value = '';
  formParentId.value = null;
  showForm.value = true;
}

function openEdit(category: Category) {
  editingCategory.value = category;
  formName.value = category.name;
  formParentId.value = category.parentId;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingCategory.value = null;
  errorMessage.value = '';
}

async function handleSubmit() {
  errorMessage.value = '';
  try {
    if (editingCategory.value) {
      await updateCategory({
        id: editingCategory.value.id,
        payload: { name: formName.value, parentId: formParentId.value },
      });
    } else {
      await createCategory({ name: formName.value, parentId: formParentId.value });
    }
    closeForm();
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}

async function handleDelete(category: Category) {
  if (!confirm(`Delete category "${category.name}"?`)) return;
  try {
    await deleteCategory(category.id);
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}
</script>

<template>
  <div class="categories-page">
    <div class="page-header">
      <h2 class="page-title">Categories</h2>
      <PermissionGuard permission="category.create">
        <button class="btn-primary" @click="openCreate">+ New Category</button>
      </PermissionGuard>
    </div>

    <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

    <div v-if="showForm" class="form-card">
      <h3>{{ editingCategory ? 'Edit Category' : 'New Category' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="cat-name">Name</label>
          <input id="cat-name" v-model="formName" type="text" required />
        </div>
        <div class="form-group">
          <label for="cat-parent">Parent Category</label>
          <select id="cat-parent" v-model="formParentId">
            <option :value="null">None (root)</option>
            <option
              v-for="cat in categories.filter(c => c.id !== editingCategory?.id)"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeForm">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isCreating">Save</button>
        </div>
      </form>
    </div>

    <div v-if="isLoading" class="loading">Loading categories...</div>
    <div v-else-if="categories.length === 0" class="empty-state">No categories yet.</div>
    <ul v-else class="category-list">
      <li v-for="category in categories" :key="category.id" class="category-item">
        <div class="category-info">
          <strong>{{ category.name }}</strong>
          <span class="category-slug">{{ category.slug }}</span>
        </div>
        <div class="category-actions">
          <PermissionGuard permission="category.update">
            <button class="btn-sm" @click="openEdit(category)">Edit</button>
          </PermissionGuard>
          <PermissionGuard permission="category.delete">
            <button class="btn-sm btn-sm-danger" @click="handleDelete(category)">Delete</button>
          </PermissionGuard>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.categories-page {
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

.form-group input,
.form-group select {
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

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.category-slug {
  margin-left: 0.5rem;
  color: #9ca3af;
  font-size: 0.85rem;
}

.category-actions {
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
