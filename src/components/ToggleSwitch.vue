<template>
  <label class="toggle-switch">
    <input type="checkbox" :disabled="disabled" v-model="model">
    <span class="toggle-slider"></span>
  </label>
</template>

<script setup>
const model = defineModel();
defineProps({
  disabled: { type: Boolean, default: false }
});
</script>

<style scoped>
.toggle-switch { position: relative; display: inline-block; width: 50px; height: 26px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
.toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
.toggle-switch input:checked + .toggle-slider { background-color: var(--primary-green); }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(24px); }
</style>
