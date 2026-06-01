<template>
  <header class="dash-header">
    <div class="header-titles">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true }
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
}
.dash-header p {
  color: #666;
  margin-bottom: 20px;
}
</style>
