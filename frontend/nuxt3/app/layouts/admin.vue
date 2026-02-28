<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col">
      <div class="p-4 border-b border-gray-700">
        <NuxtLink to="/admin/articles" class="text-xl font-bold">
          Modern CMS
        </NuxtLink>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          to="/admin/articles"
          class="nav-link"
          active-class="nav-link-active"
        >
          📝 Articles
        </NuxtLink>
        <NuxtLink
          v-if="hasPermission('category.read')"
          to="/admin/categories"
          class="nav-link"
          active-class="nav-link-active"
        >
          📂 Categories
        </NuxtLink>
        <NuxtLink
          v-if="hasPermission('tag.read')"
          to="/admin/tags"
          class="nav-link"
          active-class="nav-link-active"
        >
          🏷️ Tags
        </NuxtLink>
        <NuxtLink
          v-if="hasPermission('user.read')"
          to="/admin/users"
          class="nav-link"
          active-class="nav-link-active"
        >
          👥 Users
        </NuxtLink>
      </nav>
      <div class="p-4 border-t border-gray-700">
        <div class="text-sm text-gray-400 mb-2">
          {{ user?.name }}
          <span class="text-xs bg-gray-700 px-2 py-0.5 rounded ml-1">
            {{ user?.role }}
          </span>
        </div>
        <button
          class="w-full text-left text-sm text-gray-400 hover:text-white"
          @click="handleLogout"
        >
          🚪 Logout
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth();
const { hasPermission } = usePermissions();

async function handleLogout() {
  await logout();
}
</script>

<style scoped>
.nav-link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: #d1d5db;
  font-size: 0.875rem;
}
.nav-link:hover {
  background-color: #374151;
  color: #ffffff;
}
.nav-link-active {
  background-color: #374151;
  color: #ffffff;
}
</style>
