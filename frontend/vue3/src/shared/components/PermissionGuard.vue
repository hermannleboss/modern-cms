<script setup lang="ts">
import { usePermissions } from '@/shared/composables/usePermissions';

const props = defineProps<{
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
}>();

const { can, canAny, canAll } = usePermissions();

function hasAccess(): boolean {
  if (props.permission) {
    return can(props.permission);
  }
  if (props.permissions) {
    return props.requireAll
      ? canAll(...props.permissions)
      : canAny(...props.permissions);
  }
  return true;
}
</script>

<template>
  <slot v-if="hasAccess()" />
  <slot v-else name="fallback" />
</template>
