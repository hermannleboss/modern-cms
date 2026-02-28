<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Invite User</h1>
      <NuxtLink to="/admin/users" class="text-gray-600 hover:text-gray-900">
        ← Back to users
      </NuxtLink>
    </div>

    <form class="bg-white rounded-lg shadow-sm p-6 max-w-lg space-y-4" @submit.prevent="handleSubmit">
      <div v-if="createUser.error.value" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {{ getErrorMessage(createUser.error.value) }}
      </div>

      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          class="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          id="role"
          v-model="form.role"
          class="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="viewer">Viewer</option>
          <option value="contributor">Contributor</option>
          <option value="author">Author</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div class="flex justify-end gap-3">
        <NuxtLink
          to="/admin/users"
          class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </NuxtLink>
        <button
          type="submit"
          :disabled="createUser.isPending.value"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ createUser.isPending.value ? 'Creating...' : 'Create User' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types';

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  permission: 'user.invite',
});

const createUser = useCreateUser();

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'viewer' as UserRole,
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An error occurred';
}

async function handleSubmit() {
  await createUser.mutateAsync({
    name: form.name,
    email: form.email,
    password: form.password,
    role: form.role,
  });
  navigateTo('/admin/users');
}
</script>
