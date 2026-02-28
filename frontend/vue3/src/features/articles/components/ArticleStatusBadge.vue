<script setup lang="ts">
import type { ArticleStatus } from '../types/article.model';

defineProps<{
  status: ArticleStatus;
}>();

const statusConfig: Record<ArticleStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'badge-draft' },
  in_review: { label: 'In Review', className: 'badge-review' },
  published: { label: 'Published', className: 'badge-published' },
  archived: { label: 'Archived', className: 'badge-archived' },
};
</script>

<template>
  <span class="status-badge" :class="statusConfig[status].className">
    {{ statusConfig[status].label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-draft {
  background: #e5e7eb;
  color: #374151;
}

.badge-review {
  background: #fef3c7;
  color: #92400e;
}

.badge-published {
  background: #d1fae5;
  color: #065f46;
}

.badge-archived {
  background: #f3e8ff;
  color: #6b21a8;
}
</style>
