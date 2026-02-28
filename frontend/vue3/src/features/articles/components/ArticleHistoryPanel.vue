<script setup lang="ts">
import type { ArticleHistoryEntry } from '../types/article.model';
import { formatDate } from '@/shared/utils/date';

defineProps<{
  history: ArticleHistoryEntry[];
}>();
</script>

<template>
  <div class="history-panel">
    <h3 class="panel-title">Edit History</h3>
    <div v-if="history.length === 0" class="empty-state">
      No edit history yet.
    </div>
    <ul v-else class="history-list">
      <li v-for="entry in history" :key="entry.id" class="history-entry">
        <div class="entry-header">
          <strong>{{ entry.editedBy.name }}</strong>
          <span class="entry-date">{{ formatDate(entry.editedAt) }}</span>
        </div>
        <p class="entry-summary">{{ entry.summary }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.history-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: #111827;
}

.empty-state {
  color: #6b7280;
  font-size: 0.9rem;
  font-style: italic;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-entry {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #f3f4f6;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.entry-date {
  color: #6b7280;
  font-size: 0.8rem;
}

.entry-summary {
  margin: 0;
  font-size: 0.85rem;
  color: #374151;
}
</style>
