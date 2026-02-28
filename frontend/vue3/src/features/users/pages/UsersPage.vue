<script setup lang="ts">
import { ref } from 'vue';
import { useUsers } from '../composables/useUsers';
import { extractApiError } from '@/shared/api/api-error';
import { formatDate } from '@/shared/utils/date';
import PermissionGuard from '@/shared/components/PermissionGuard.vue';

const { users, isLoading, inviteUser, isInviting } = useUsers();

const showInviteForm = ref(false);
const inviteName = ref('');
const inviteEmail = ref('');
const inviteRoleId = ref('');
const errorMessage = ref('');

function openInviteForm() {
  inviteName.value = '';
  inviteEmail.value = '';
  inviteRoleId.value = '';
  showInviteForm.value = true;
}

function closeInviteForm() {
  showInviteForm.value = false;
  errorMessage.value = '';
}

async function handleInvite() {
  errorMessage.value = '';
  try {
    await inviteUser({
      name: inviteName.value,
      email: inviteEmail.value,
      roleId: inviteRoleId.value,
    });
    closeInviteForm();
  } catch (err) {
    errorMessage.value = extractApiError(err).message;
  }
}
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <h2 class="page-title">Users</h2>
      <PermissionGuard permission="user.invite">
        <button class="btn-primary" @click="openInviteForm">+ Invite User</button>
      </PermissionGuard>
    </div>

    <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

    <div v-if="showInviteForm" class="form-card">
      <h3>Invite User</h3>
      <form @submit.prevent="handleInvite">
        <div class="form-group">
          <label for="invite-name">Name</label>
          <input id="invite-name" v-model="inviteName" type="text" required />
        </div>
        <div class="form-group">
          <label for="invite-email">Email</label>
          <input id="invite-email" v-model="inviteEmail" type="email" required />
        </div>
        <div class="form-group">
          <label for="invite-role">Role ID</label>
          <input id="invite-role" v-model="inviteRoleId" type="text" required placeholder="Role identifier" />
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeInviteForm">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isInviting">
            {{ isInviting ? 'Inviting...' : 'Send Invite' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="isLoading" class="loading">Loading users...</div>
    <div v-else-if="users.length === 0" class="empty-state">No users found.</div>
    <table v-else class="users-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Joined</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td>
            <span class="role-badge">{{ u.roleName }}</span>
          </td>
          <td>{{ formatDate(u.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.users-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: #111827;
}

.error-banner {
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.form-card h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.loading,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.users-table th,
.users-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
}

.users-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.users-table tr:last-child td {
  border-bottom: none;
}

.role-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>
