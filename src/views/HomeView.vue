<template>
  <main class="login-wrapper">
    <div class="login-box">
      <h1>GreenTech ERP</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <!-- Corrigido: label vinculado ao input via id -->
          <label for="username">Usuário</label>
          <input 
            id="username"
            v-model="username" 
            type="text" 
            required 
            placeholder="Seu usuário"
            :disabled="carregando"
          />
        </div>

        <div class="form-group">
          <!-- Corrigido: label vinculado ao input via id -->
          <label for="password">Senha</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            required 
            placeholder="Sua senha"
            :disabled="carregando"
          />
        </div>

        <!-- Botão com estado visual de loading desabilitado -->
        <button type="submit" class="btn-primary" :disabled="carregando">
          <span v-if="carregando">Acessando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { apiClient } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const username = ref('')
const password = ref('')
const carregando = ref(false)

async function handleLogin() {
  if (carregando.value) return
  carregando.value = true

  try {
    const data = await apiClient('/token/', {
      method: 'POST',
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    authStore.setLoginData(data)
    toastStore.success('Bem-vindo ao GreenTech!')
    router.push({ name: 'dashboard' })
  } catch (error) {
    toastStore.error(error.message || 'Credenciais inválidas.')
  } finally {
    carregando.value = false
  }
}
</script>