<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Categories</h1>
    </div>

    <!-- Create form -->
    <PermissionGuard permission="category.create">
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form class="flex gap-3" @submit.prevent="handleCreate">
          <input
            v-model="newCategoryName"
            type="text"
            required
            placeholder="Category name"
            class="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <select
            v-model="newCategoryParent"
            class="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">No parent</option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
          <button
            type="submit"
            :disabled="createCategory.isPending.value"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Add Category
          </button>
        </form>
      </div>
    </PermissionGuard>

    <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading categories...</div>

    <div v-else-if="isError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      Failed to load categories.
    </div>

    <div v-else-if="categories?.length" class="bg-white rounded-lg shadow-sm">
      <div class="divide-y">
        <CategoryItem
          v-for="category in categories"
          :key="category.id"
          :category="category"
          :depth="0"
        />
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500">No categories found.</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
});

const { data: categories, isLoading, isError } = useCategories();
const createCategory = useCreateCategory();

const newCategoryName = ref('');
const newCategoryParent = ref('');

async function handleCreate() {
  await createCategory.mutateAsync({
    name: newCategoryName.value,
    parentId: newCategoryParent.value || undefined,
  });
  newCategoryName.value = '';
  newCategoryParent.value = '';
}
</script>
