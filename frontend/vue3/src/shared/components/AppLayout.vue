<script setup lang="ts">
import { useAuth } from '@/features/auth/composables/useAuth';
import { useRouter } from 'vue-router';

const { user, logout, isLoggingOut } = useAuth();
const router = useRouter();

async function handleLogout() {
  try {
    await logout();
  } finally {
    router.push('/login');
  }
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">Modern CMS</h1>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/articles" class="nav-link">Articles</RouterLink>
        <RouterLink to="/categories" class="nav-link">Categories</RouterLink>
        <RouterLink to="/tags" class="nav-link">Tags</RouterLink>
        <RouterLink to="/users" class="nav-link">Users</RouterLink>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <span class="user-name">{{ user?.name }}</span>
          <span class="user-role">{{ user?.role?.name }}</span>
        </div>
        <button class="btn-logout" :disabled="isLoggingOut" @click="handleLogout">
          {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
        </button>
      </div>
    </aside>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  margin-bottom: 0.75rem;
}

.user-name {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: capitalize;
}

.btn-logout {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-logout:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.btn-logout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: #f5f5f5;
  overflow-y: auto;
}
</style>
