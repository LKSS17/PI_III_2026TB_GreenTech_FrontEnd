<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Configurações ⚙️</h1>
        <p>Preferências do sistema, notificações e parâmetros operacionais.</p>
      </div>
    </header>

    <section class="config-layout">
      <nav class="config-nav">
        <button class="config-nav-item" :class="{ active: abaAtiva === 'notificacoes' }" @click="abaAtiva = 'notificacoes'">
          <span class="material-symbols-outlined">notifications</span><span>Notificações</span>
        </button>
        <button class="config-nav-item" :class="{ active: abaAtiva === 'alertas' }" @click="abaAtiva = 'alertas'">
          <span class="material-symbols-outlined">warning</span><span>Limites de Alerta</span>
        </button>
        <button class="config-nav-item" :class="{ active: abaAtiva === 'sistema' }" @click="abaAtiva = 'sistema'">
          <span class="material-symbols-outlined">tune</span><span>Sistema</span>
        </button>
        <button class="config-nav-item" :class="{ active: abaAtiva === 'dados' }" @click="abaAtiva = 'dados'">
          <span class="material-symbols-outlined">database</span><span>Dados e Backup</span>
        </button>
        <button class="config-nav-item" :class="{ active: abaAtiva === 'sobre' }" @click="abaAtiva = 'sobre'">
          <span class="material-symbols-outlined">info</span><span>Sobre o Sistema</span>
        </button>
      </nav>

      <div class="config-content">
        <div v-show="abaAtiva === 'notificacoes'" class="config-section active">
          <h3 class="config-section-title"><span class="material-symbols-outlined">notifications</span> Preferências de Notificação</h3>
          <div class="config-group">
            <div class="config-row">
              <div class="config-row-info"><strong>Alertas de Temperatura</strong><p>Avisos para limites excedidos.</p></div>
              <label class="toggle-switch"><input type="checkbox" v-model="config.notifTemp"><span class="toggle-slider"></span></label>
            </div>
            <div class="config-row">
              <div class="config-row-info"><strong>Alertas de Umidade</strong><p>Avisos para variação de umidade.</p></div>
              <label class="toggle-switch"><input type="checkbox" v-model="config.notifUmid"><span class="toggle-slider"></span></label>
            </div>
          </div>
        </div>

        <div v-show="abaAtiva === 'alertas'" class="config-section active">
          <h3 class="config-section-title"><span class="material-symbols-outlined">warning</span> Limites Operacionais</h3>
          <div class="config-group">
            <div class="limite-grid">
              <div class="form-group"><label>Temp. Mínima (°C)</label><input type="number" v-model="limites.tempMin" /></div>
              <div class="form-group"><label>Temp. Máxima (°C)</label><input type="number" v-model="limites.tempMax" /></div>
            </div>
          </div>
          <button class="btn-generate" style="margin-top:20px" @click="salvarLimites"><span class="material-symbols-outlined">save</span> Salvar</button>
        </div>

        <div v-show="abaAtiva === 'dados'" class="config-section active">
          <h3 class="config-section-title"><span class="material-symbols-outlined">database</span> Dados e Backup</h3>
          <div class="config-group">
            <div class="dados-acoes">
              <div class="dado-action-card">
                <span class="material-symbols-outlined dado-icon">download</span>
                <div><strong>Exportar Lotes (CSV)</strong><p>Baixe todos os lotes registrados.</p></div>
                <button class="btn-outline">Exportar</button>
              </div>
              <div class="dado-action-card danger">
                <span class="material-symbols-outlined dado-icon" style="color:#d32f2f">delete_forever</span>
                <div><strong>Limpar Dados de Teste</strong><p>Remove lotes simulados.</p></div>
                <button class="btn-delete" @click="limparDados" style="background:#ffebee;color:#d32f2f;border:1px solid #ffcdd2;padding:8px 15px;border-radius:10px;">Limpar</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <Footer />
  </main>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";

const abaAtiva = ref('notificacoes');

const config = ref({ notifTemp: true, notifUmid: true });
const limites = ref({ tempMin: 15, tempMax: 30 });

const salvarLimites = () => {
  if (limites.value.tempMin >= limites.value.tempMax) {
    alert("A Temperatura Mínima não pode ser maior ou igual à Máxima.");
    return;
  }
  alert("Limites salvos com sucesso!");
};

const limparDados = () => {
  if (confirm("ATENÇÃO: Você está prestes a apagar todos os lotes e dados simulados. Deseja continuar?")) {
    alert("Dados limpos com sucesso. O ambiente foi resetado.");
  }
};
</script>
