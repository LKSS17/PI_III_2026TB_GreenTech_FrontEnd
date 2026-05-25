<template>
  <Sidebar />
  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Plantações Ativas </h1>
        <p>Visão geral de culturas em desenvolvimento nas estufas.</p>
      </div>
      <WeatherWidget />
    </header>

    <section class="sensores-grid-container" style="padding-top: 20px;">
      <div v-if="plantacoes.length === 0" class="empty-state">Nenhuma plantação ativa no momento.</div>
      <div class="sensores-grid">
        <div v-for="p in plantacoes" :key="p.id" class="sensor-card">
          <div class="sensor-card-header">
            <div>
              <div class="sensor-card-title">{{ p.cultura_nome }}</div>
              <div class="sensor-card-location">
                <span class="material-symbols-outlined" style="font-size:0.85rem;vertical-align:middle;">location_on</span>
                {{ p.estufa_nome }} — {{ p.mesa_codigo }}
              </div>
            </div>
            <span class="badge badge-good">No Prazo</span>
          </div>
          <div class="sensor-card-footer" style="margin-top: 15px;">
            <span class="material-symbols-outlined">calendar_month</span> Data de Plantio: {{ p.data_plantio }}
          </div>
        </div>
      </div>
    </section>
    <Footer/>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";

const plantacoes = ref([]);

const carregarPlantacoes = async () => {
  try {
    const token = localStorage.getItem('access_token');
    // Supondo que você crie uma view no Django para listar os Lotes de Plantio Ativos
    const res = await fetch('http://127.0.0.1:8000/api/lotePlantio/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      plantacoes.value = await res.json();
    }
  } catch (error) {
    console.error("Erro ao buscar plantações:", error);
  }
};

onMounted(() => carregarPlantacoes());
</script>
