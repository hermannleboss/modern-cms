<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-bold text-center mb-6">Login</h1>

      <div v-if="loginError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {{ getErrorMessage(loginError) }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoggingIn"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isLoggingIn ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { login, loginError, isLoggingIn } = useAuth();

const form = reactive({
  email: '',
  password: '',
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Invalid credentials';
}

async function handleSubmit() {
  try {
    await login({ email: form.email, password: form.password });
    navigateTo('/admin/articles');
  } catch {
    // loginError is set by useAuth — stay on login page
  }
}
</script>
