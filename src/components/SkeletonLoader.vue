<template>
  <div 
    class="skeleton-pulse" 
    :style="{ 
      width: largura, 
      height: altura, 
      borderRadius: raio 
    }"
    aria-hidden="true"
  ></div>
</template>

<script setup>
defineProps({
  largura: {
    type: String,
    default: '100%'
  },
  altura: {
    type: String,
    default: '20px'
  },
  raio: {
    type: String,
    default: '4px'
  }
})
</script>

<style scoped>
.skeleton-pulse {
  background: #e0e0e0;
  background: linear-gradient(
    90deg, 
    #eceff1 0%, 
    #f5f7f8 50%, 
    #eceff1 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  display: inline-block;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>