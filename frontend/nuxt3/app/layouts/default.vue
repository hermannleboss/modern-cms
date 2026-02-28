<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-gray-900">
          Modern CMS
        </NuxtLink>
        <nav class="flex items-center gap-4">
          <NuxtLink to="/login" class="text-gray-600 hover:text-gray-900">
            Login
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>
