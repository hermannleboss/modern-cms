<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Tags</h1>
    </div>

    <!-- Create form -->
    <PermissionGuard permission="tag.create">
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form class="flex gap-3" @submit.prevent="handleCreate">
          <input
            v-model="newTagName"
            type="text"
            required
            placeholder="New tag name"
            class="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <button
            type="submit"
            :disabled="createTag.isPending.value"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Add Tag
          </button>
        </form>
      </div>
    </PermissionGuard>

    <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading tags...</div>

    <div v-else-if="isError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      Failed to load tags.
    </div>

    <div v-else-if="tags?.length" class="bg-white rounded-lg shadow-sm">
      <div class="divide-y">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="flex items-center justify-between px-4 py-3"
        >
          <div v-if="editingId === tag.id" class="flex gap-2 flex-1">
            <input
              v-model="editingName"
              type="text"
              class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button
              class="text-sm text-green-600 hover:underline"
              @click="handleUpdate(tag.id)"
            >
              Save
            </button>
            <button
              class="text-sm text-gray-600 hover:underline"
              @click="editingId = ''"
            >
              Cancel
            </button>
          </div>
          <template v-else>
            <div>
              <span class="font-medium">{{ tag.name }}</span>
              <span class="text-sm text-gray-400 ml-2">{{ tag.slug }}</span>
            </div>
            <div class="flex gap-2">
              <button
                v-if="hasPermission('tag.update')"
                class="text-sm text-blue-600 hover:underline"
                @click="startEditing(tag)"
              >
                Edit
              </button>
              <button
                v-if="hasPermission('tag.delete')"
                class="text-sm text-red-600 hover:underline"
                @click="handleDelete(tag.id)"
              >
                Delete
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500">No tags found.</div>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from '~/types';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
});

const { hasPermission } = usePermissions();
const { data: tags, isLoading, isError } = useTags();
const createTag = useCreateTag();
const updateTag = useUpdateTag();
const deleteTag = useDeleteTag();

const newTagName = ref('');
const editingId = ref('');
const editingName = ref('');

function startEditing(tag: Tag) {
  editingId.value = tag.id;
  editingName.value = tag.name;
}

async function handleCreate() {
  await createTag.mutateAsync({ name: newTagName.value });
  newTagName.value = '';
}

async function handleUpdate(id: string) {
  await updateTag.mutateAsync({ id, payload: { name: editingName.value } });
  editingId.value = '';
}

async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to delete this tag?')) return;
  await deleteTag.mutateAsync(id);
}
</script>
