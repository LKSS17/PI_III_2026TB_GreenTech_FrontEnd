<template>
  <header class="dash-header">
    <div class="header-titles">
      <h1>
        <MobileMenuButton />
        {{ title }}
      </h1>
      <p>{{ subtitle }}</p>
    </div>

    <!-- Qualquer view pode injetar aqui: WeatherWidget, filtro, botão de ação, etc. -->
    <slot name="actions" />
  </header>
</template>

<script setup>
import MobileMenuButton from '@/components/MobileMenuButton.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<style scoped>
.dash-header {
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.dash-header h1 {
  font-family: 'Poppins', sans-serif;
  color: var(--primary-green, #3a5a40);
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0;
}

.dash-header p {
  color: #666;
  margin: 0.25rem 0 0 0;
}

@media (max-width: 768px) {
  .dash-header {
    padding: 0 15px;
  }
  .dash-header h1 {
    font-size: 1.5rem;
  }
}
</style>
