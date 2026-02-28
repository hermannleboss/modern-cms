<template>
  <span :class="badgeClass" class="inline-block px-2 py-0.5 rounded text-xs font-medium">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import type { ArticleStatus } from '~/types';

const props = defineProps<{
  status: ArticleStatus;
}>();

const statusConfig: Record<ArticleStatus, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'bg-gray-100 text-gray-700' },
  in_review: { label: 'In Review', class: 'bg-yellow-100 text-yellow-800' },
  published: { label: 'Published', class: 'bg-green-100 text-green-800' },
  archived: { label: 'Archived', class: 'bg-red-100 text-red-700' },
};

const label = computed(() => statusConfig[props.status]?.label || props.status);
const badgeClass = computed(() => statusConfig[props.status]?.class || 'bg-gray-100 text-gray-700');
</script>
