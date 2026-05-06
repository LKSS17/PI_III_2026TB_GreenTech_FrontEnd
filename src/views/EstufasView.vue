<script setup>

import Sidebar from "@/components/Sidebar.vue";
import Footer from "@/components/Footer.vue";
</script>

<template>

  <Sidebar />

  <main class="main-content">
    <div class="weather-time-container">
      <div class="weather-info">
        <span class="material-symbols-outlined weather-icon">partly_cloudy_day</span>
        <span id="temp">24°C</span>
      </div>
      <div class="time-info" id="clock">00:00:00</div>
    </div>

    <header class="dash-header">
      <h1>Estufas e Mesas 🌿</h1>
      <p>Gestão espacial do cultivo — visualização e ocupação de mesas por estufa.</p>
    </header>

    <div class="estufa-selector-bar">
      <button class="estufa-tab active" onclick="selecionarEstufa('E01', this)">Estufa 01</button>
      <button class="estufa-tab" onclick="selecionarEstufa('E02', this)">Estufa 02</button>
      <button class="estufa-tab" onclick="selecionarEstufa('E03', this)">Estufa 03</button>
    </div>

    <section class="estufas-split-view">
      <div class="mapa-container">
        <div class="mapa-header">
          <h3 id="mapa-titulo">Estufa 01 — Planta Baixa</h3>
          <div class="mapa-legenda">
            <span class="legenda-item legenda-livre"><span></span> Livre</span>
            <span class="legenda-item legenda-cultivo"><span></span> Em Cultivo</span>
            <span class="legenda-item legenda-colheita"><span></span> Próx. Colheita</span>
          </div>
        </div>
        <div class="mapa-grid" id="mapa-mesas"></div>
      </div>
      <div class="mesa-detalhe-panel" id="mesa-detalhe">
        <div class="detalhe-placeholder" style="text-align: center; color:#aaa; margin-top:50px;">
          <span class="material-symbols-outlined" style="font-size:3rem;color:#ccc">touch_app</span>
          <p>Selecione uma mesa para ver detalhes</p>
        </div>
      </div>
    </section>

    <section class="estufa-resumo" id="estufa-resumo"></section>

    <Footer/>
  </main>
</template>

<style scoped>

</style>
