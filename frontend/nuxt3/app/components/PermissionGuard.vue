<template>
  <slot v-if="allowed" />
  <slot v-else name="fallback">
    <div class="text-center py-12 text-gray-500">
      You don't have permission to access this section.
    </div>
  </slot>
</template>

<script setup lang="ts">
import type { Permission } from '~/types';

const props = defineProps<{
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
}>();

const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

const allowed = computed(() => {
  if (props.permission) {
    return hasPermission(props.permission);
  }
  if (props.permissions) {
    return props.requireAll
      ? hasAllPermissions(props.permissions)
      : hasAnyPermission(props.permissions);
  }
  return true;
});
</script>
