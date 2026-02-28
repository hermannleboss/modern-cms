<script setup lang="ts">
import type { ArticleLock } from '../types/article.model';
import { formatRelativeDate } from '@/shared/utils/date';

defineProps<{
  lock: ArticleLock;
  isLockedByMe: boolean;
  canForceUnlock: boolean;
  isForcingUnlock: boolean;
}>();

defineEmits<{
  forceUnlock: [];
}>();
</script>

<template>
  <div class="lock-banner" :class="{ 'lock-mine': isLockedByMe, 'lock-other': !isLockedByMe }">
    <div class="lock-info">
      <span class="lock-icon">🔒</span>
      <span v-if="isLockedByMe">
        You are currently editing this article.
        Lock expires {{ formatRelativeDate(lock.expiresAt) }}.
      </span>
      <span v-else>
        This article is being edited by <strong>{{ lock.lockedBy.name }}</strong>.
        Lock expires {{ formatRelativeDate(lock.expiresAt) }}.
      </span>
    </div>
    <button
      v-if="canForceUnlock && !isLockedByMe"
      class="btn-force-unlock"
      :disabled="isForcingUnlock"
      @click="$emit('forceUnlock')"
    >
      {{ isForcingUnlock ? 'Unlocking...' : 'Force Unlock' }}
    </button>
  </div>
</template>

<style scoped>
.lock-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.lock-mine {
  background: #dbeafe;
  border: 1px solid #93c5fd;
  color: #1e40af;
}

.lock-other {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
}

.lock-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lock-icon {
  font-size: 1.1rem;
}

.btn-force-unlock {
  padding: 0.375rem 0.75rem;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.btn-force-unlock:hover:not(:disabled) {
  background: #dc2626;
}

.btn-force-unlock:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
