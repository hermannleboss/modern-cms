<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue';
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <LoginForm />
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 460px;
  padding: 1rem;
}
</style>
