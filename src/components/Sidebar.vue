<template>
  <aside 
    :class="['sidebar-nav', { 'mobile-open': isOpen, 'touch-expanded': touchExpanded }]"
    aria-label="Navegação Principal"
  >
    <div class="sidebar-header">
      <span class="brand-title">GreenTech</span>
      <button 
        type="button" 
        class="btn-close-mobile" 
        @click="$emit('close')"
        aria-label="Fechar menu lateral"
      >
        &times;
      </button>
    </div>

    <ul class="nav-list">
      <li class="nav-item">
        <RouterLink to="/dashboard" class="nav-link" @click="handleNavClick">
          <span class="icon">📊</span>
          <span class="label">Dashboard</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/culturas" class="nav-link" @click="handleNavClick">
          <span class="icon">🌱</span>
          <span class="label">Culturas</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/lotes" class="nav-link" @click="handleNavClick">
          <span class="icon">🌾</span>
          <span class="label">Lotes</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/colheitas" class="nav-link" @click="handleNavClick">
          <span class="icon">🚜</span>
          <span class="label">Colheitas</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/sensores" class="nav-link" @click="handleNavClick">
          <span class="icon">📟</span>
          <span class="label">Sensores</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/irrigacao" class="nav-link" @click="handleNavClick">
          <span class="icon">💧</span>
          <span class="label">Irrigação</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/estoque" class="nav-link" @click="handleNavClick">
          <span class="icon">📦</span>
          <span class="label">Estoque</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/ocr-notas" class="nav-link" @click="handleNavClick">
          <span class="icon">📄</span>
          <span class="label">Importar NF (OCR)</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/alertas" class="nav-link" @click="handleNavClick">
          <span class="icon">🔔</span>
          <span class="label">Alertas</span>
        </RouterLink>
      </li>

      <!-- Corrigido: <li> direto dentro da <ul> sem envolver com <div> -->
      <li v-if="authStore.isGerente || authStore.isAdmin" class="nav-item">
        <RouterLink to="/historico" class="nav-link" @click="handleNavClick">
          <span class="icon">📜</span>
          <span class="label">Auditoria & Histórico</span>
        </RouterLink>
      </li>

      <li class="nav-item">
        <RouterLink to="/perfil" class="nav-link" @click="handleNavClick">
          <span class="icon">👤</span>
          <span class="label">Meu Perfil</span>
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const authStore = useAuthStore()
const touchExpanded = ref(false)

function handleNavClick() {
  emit('close')
}
</script>

<style scoped>
.sidebar-nav {
  width: 240px;
  background-color: var(--cor-fundo-sidebar, #1b5e20);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, transform 0.3s ease;
  z-index: 1000;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.btn-close-mobile {
  display: none;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.75rem;
  cursor: pointer;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1.25rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.icon {
  font-size: 1.15rem;
}

/* Suporte de 768px a 1024px (Tablets) e mobile */
@media (max-width: 1024px) {
  .sidebar-nav {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.25);
  }

  .sidebar-nav.mobile-open {
    transform: translateX(0);
  }

  .btn-close-mobile {
    display: block;
  }
}
</style>