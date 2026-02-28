<template>
  <div>
    <div
      class="flex items-center justify-between px-4 py-3"
      :style="{ paddingLeft: `${depth * 1.5 + 1}rem` }"
    >
      <div v-if="isEditing" class="flex gap-2 flex-1">
        <input
          v-model="editName"
          type="text"
          class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <button
          class="text-sm text-green-600 hover:underline"
          @click="handleUpdate"
        >
          Save
        </button>
        <button
          class="text-sm text-gray-600 hover:underline"
          @click="isEditing = false"
        >
          Cancel
        </button>
      </div>
      <template v-else>
        <div>
          <span v-if="depth > 0" class="text-gray-400 mr-1">└</span>
          <span class="font-medium">{{ category.name }}</span>
          <span class="text-sm text-gray-400 ml-2">{{ category.slug }}</span>
        </div>
        <div class="flex gap-2">
          <button
            v-if="hasPermission('category.update')"
            class="text-sm text-blue-600 hover:underline"
            @click="startEditing"
          >
            Edit
          </button>
          <button
            v-if="hasPermission('category.delete')"
            class="text-sm text-red-600 hover:underline"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </template>
    </div>
    <CategoryItem
      v-for="child in category.children"
      :key="child.id"
      :category="child"
      :depth="depth + 1"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types';

const props = defineProps<{
  category: Category;
  depth: number;
}>();

const { hasPermission } = usePermissions();
const updateCategory = useUpdateCategory();
const deleteCategory = useDeleteCategory();

const isEditing = ref(false);
const editName = ref('');

function startEditing() {
  editName.value = props.category.name;
  isEditing.value = true;
}

async function handleUpdate() {
  await updateCategory.mutateAsync({
    id: props.category.id,
    payload: { name: editName.value },
  });
  isEditing.value = false;
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this category?')) return;
  await deleteCategory.mutateAsync(props.category.id);
}
</script>
