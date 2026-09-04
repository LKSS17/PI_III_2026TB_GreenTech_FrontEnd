<template>
  <Sidebar />
  <main class="main-content">
    <DashHeader :title="title" :subtitle="subtitle">
      <template #actions>
        <slot name="header-actions" />
      </template>
    </DashHeader>

    <slot />

    <Footer />
  </main>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Footer from '@/components/Footer.vue'
import DashHeader from '@/components/DashHeader.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>
