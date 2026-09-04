<template>
  <button class="menu-toggle" @click="toggle" aria-label="Abrir menu">
    <span class="material-symbols-outlined">menu</span>
  </button>
</template>

<script setup>
import { useSidebar } from '@/composables/useSidebar'
const { toggle } = useSidebar()
</script>

<style scoped>
.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--primary-green, #3a5a40);
  font-size: 2.2rem;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s;
}

.menu-toggle:active {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
