<template>
  <div class="dado-action-card" :class="{ danger: isDanger }">
    <span class="material-symbols-outlined dado-icon" :style="iconStyle">{{ icon }}</span>
    <div>
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
    </div>
    <div class="action-btn">
      <slot name="button"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isDanger: { type: Boolean, default: false },
  iconStyle: { type: String, default: '' }
});
</script>

<style scoped>
.dado-action-card { display: flex; align-items: center; gap: 20px; background: rgba(255,255,255,0.6); padding: 20px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); }
.dado-action-card .dado-icon { font-size: 2rem; color: var(--primary-green); }
.dado-action-card div { flex: 1; }
.dado-action-card strong { font-size: 1.1rem; color: var(--primary-dark); }
.dado-action-card p { color: #666; font-size: 0.85rem; margin-top: 5px; }
.dado-action-card.danger { background: #fff0f0; border-color: #ffcdd2; }

@media (max-width: 768px) {
  .dado-action-card { flex-direction: column; text-align: center; }
  .action-btn { width: 100%; display: flex; justify-content: center; }
}
</style>
