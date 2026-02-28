<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppLayout from '@/shared/components/AppLayout.vue';
import { useAuth } from '@/features/auth/composables/useAuth';
import { useRoute } from 'vue-router';

const { isAuthenticated } = useAuth();
const route = useRoute();
</script>

<template>
  <AppLayout v-if="isAuthenticated && route.meta.public !== true">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #111827;
}

a {
  color: inherit;
  text-decoration: none;
}
</style>
