<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Users</h1>
      <NuxtLink
        v-if="hasPermission('user.invite')"
        to="/admin/users/invite"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Invite User
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading users...</div>

    <div v-else-if="isError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      Failed to load users.
    </div>

    <div v-else-if="users?.data?.length" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Name</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Role</th>
            <th class="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="u in users.data" :key="u.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium">{{ u.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ u.email }}</td>
            <td class="px-4 py-3">
              <select
                v-if="hasPermission('user.assign_role')"
                :value="u.role"
                class="border border-gray-300 rounded px-2 py-1 text-sm"
                @change="handleRoleChange(u.id, ($event.target as HTMLSelectElement).value)"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="author">Author</option>
                <option value="contributor">Contributor</option>
                <option value="viewer">Viewer</option>
              </select>
              <span v-else class="text-sm bg-gray-100 px-2 py-0.5 rounded">{{ u.role }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="hasPermission('user.delete')"
                class="text-sm text-red-600 hover:underline"
                @click="handleDelete(u.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-12 text-gray-500">No users found.</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
});

const { hasPermission } = usePermissions();
const { data: users, isLoading, isError } = useUsers();
const assignRole = useAssignRole();
const deleteUser = useDeleteUser();

async function handleRoleChange(userId: string, role: string) {
  await assignRole.mutateAsync({ userId, role });
}

async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  await deleteUser.mutateAsync(id);
}
</script>
