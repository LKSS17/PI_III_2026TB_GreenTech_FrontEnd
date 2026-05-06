<script setup>
</script>
<template>
<div class="weather-time-container">
<div class="weather-info">
  <span class="material-symbols-outlined weather-icon">partly_cloudy_day</span>
  <span>24°C</span>
</div>
<div class="time-info">10:30:00</div>
</div>
</template>

<style scoped>
.weather-time-container {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  padding: 10px 20px;
  border-radius: 15px;
  /* Margens manuais removidas, o flexbox do dash-header cuida disso agora */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.weather-info { display: flex; align-items: center; gap: 8px; color: var(--primary-green); font-weight: 700; border-right: 2px solid var(--glass-border); padding-right: 15px; }
.weather-icon { color: var(--accent-terracota); font-size: 1.8rem; }
.time-info { color: var(--primary-dark); font-family: "Poppins", sans-serif; font-size: 1.1rem; font-weight: 700; letter-spacing: 1px; }
</style>
