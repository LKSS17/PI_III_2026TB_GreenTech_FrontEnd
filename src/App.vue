<template>
  <div class="app-root">
    <RouterView />
    <ToastContainer />
    <ChatAssistantModal v-if="authStore.isAuthenticated" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'
import ChatAssistantModal from '@/components/ChatAssistantModal.vue'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.carregarPerfil()
  }
})
</script>

<style>
.app-root {
  display: flex;
  min-height: 100vh;
}
</style>
