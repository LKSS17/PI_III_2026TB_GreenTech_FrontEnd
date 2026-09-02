/**
 * src/stores/auth.js
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null)
  const carregando = ref(false)

  const isAuthenticated = computed(() => !!localStorage.getItem('access_token'))
  
  const isGerente = computed(() => {
    if (!usuario.value) return false
    return !!(usuario.value.is_gerente || usuario.value.cargo === 'Gerente' || usuario.value.is_superuser)
  })

  const isAdmin = computed(() => {
    if (!usuario.value) return false
    return !!(usuario.value.is_admin || usuario.value.is_staff || usuario.value.is_superuser)
  })

  async function carregarPerfil() {
    if (!isAuthenticated.value) return null
    if (usuario.value) return usuario.value

    try {
      carregando.value = true
      const data = await apiClient('/funcionarios/me/')
      usuario.value = data
      return data
    } catch (err) {
      console.warn('Não foi possível sincronizar o perfil com o backend.')
      return null
    } finally {
      carregando.value = false
    }
  }

  function setLoginData(tokens, dadosUsuario = null) {
    if (tokens.access) localStorage.setItem('access_token', tokens.access)
    if (tokens.refresh) localStorage.setItem('refresh_token', tokens.refresh)
    if (dadosUsuario) usuario.value = dadosUsuario
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    usuario.value = null
  }

  return {
    usuario,
    carregando,
    isAuthenticated,
    isGerente,
    isAdmin,
    carregarPerfil,
    setLoginData,
    logout
  }
})