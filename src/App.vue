<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { ref, provide } from "vue";

const menuAberto = ref(false);

const toggleMenu = () => {
  menuAberto.value = !menuAberto.value;
};

const closeMenu = () => {
  menuAberto.value = false;
};

provide('menuContext', {
  menuAberto,
  toggleMenu,
  closeMenu
});
</script>

<style>
</style>
