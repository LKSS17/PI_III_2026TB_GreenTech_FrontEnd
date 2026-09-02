<template>
  <header class="dash-header">
    <div class="header-titles">
      <h1>
        <button class="menu-toggle" @click="toggleMenu">
          <span class="material-symbols-outlined">menu</span>
        </button>
        {{ title }}
      </h1>
      <p>{{ subtitle }}</p>
    </div>
  </header>
</template>

<script setup>
import { inject } from 'vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true }
});

const { toggleMenu } = inject('menuContext', {
  toggleMenu: () => {}
});
</script>

<style scoped>
.dash-header {
  padding: 0 40px;
}

.dash-header h1 {
  font-family: "Poppins", sans-serif;
  color: var(--primary-green);
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 15px;
}

.dash-header p {
  color: #666;
  margin-bottom: 20px;
}

/* =========================================
   ESTILOS DO BOTÃO HAMBURGER
   ========================================= */

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--primary-green);
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

  .dash-header {
    padding: 0 15px;
  }
}
</style>
