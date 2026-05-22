<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Painel Geral </h1>
        <p>Bem-vindo, {{ nomeUsuario }}. Aqui está o resumo da sua produção hoje.</p>
      </div>
      <WeatherWidget/>
    </header>

    <section class="dashboard-container">

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(76, 175, 80, 0.1); color: #4CAF50;">
            <span class="material-symbols-outlined">grid_view</span>
          </div>
          <div class="kpi-info">
            <h3>Mesas Ocupadas</h3>
            <h2>{{ kpis.mesasOcupadas }} / {{ kpis.mesasTotais }}</h2>
            <p>Taxa de ocupação nas estufas</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(58, 90, 64, 0.1); color: var(--primary-green);">
            <span class="material-symbols-outlined">local_florist</span>
          </div>
          <div class="kpi-info">
            <h3>Tubetes em Estoque</h3>
            <h2>{{ kpis.tubetesDisponiveis }}</h2>
            <p>Lotes prontos para alocação</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(188, 108, 37, 0.1); color: var(--accent-terracota);">
            <span class="material-symbols-outlined">agriculture</span>
          </div>
          <div class="kpi-info">
            <h3>Próximas Colheitas</h3>
            <h2>{{ kpis.colheitasProximas }}</h2>
            <p>Mesas em ponto de colheita</p>
          </div>
        </div>
      </div>

      <div class="dashboard-widgets">

        <div class="widget-card">
          <div class="widget-header">
            <h3><span class="material-symbols-outlined">warning</span> Alertas de Estoque</h3>
            <button class="btn-link" @click="$router.push('/estoque')">Ver Estoque</button>
          </div>
          <ul class="alert-list">
            <li v-for="lote in lotesAlerta" :key="lote.id" class="alert-item">
              <div class="alert-text">
                <strong>LOTE-{{ lote.id }} ({{ lote.cultura }})</strong>
                <span>Restam apenas {{ lote.quantidade }} tubetes</span>
              </div>
              <span class="badge badge-low">Crítico</span>
            </li>
            <li v-if="lotesAlerta.length === 0" class="empty-state">
              Nenhum alerta de estoque no momento.
            </li>
          </ul>
        </div>

        <div class="widget-card">
          <div class="widget-header">
            <h3><span class="material-symbols-outlined">psychiatry</span> Cultivos em Andamento</h3>
            <button class="btn-link" @click="$router.push('/estufas')">Ir para Estufas</button>
          </div>
          <ul class="cultivo-list">
            <li v-for="mesa in mesasAtivas" :key="mesa.id" class="cultivo-item">
              <div class="cultivo-info">
                <strong>Mesa {{ mesa.id }}</strong>
                <span>{{ mesa.cultura }}</span>
              </div>
              <div class="cultivo-status">
                <span>Previsão: {{ mesa.previsaoColheita }}</span>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: mesa.progresso + '%' }"></div>
                </div>
              </div>
            </li>
            <li v-if="mesasAtivas.length === 0" class="empty-state">
              Nenhum cultivo em andamento.
            </li>
          </ul>
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

const nomeUsuario = ref('Responsável');

// Dados reativos para o Dashboard (Você vai preencher isso via API depois)
const kpis = ref({
  mesasOcupadas: 12,
  mesasTotais: 18,
  tubetesDisponiveis: 450,
  colheitasProximas: 2
});

const lotesAlerta = ref([
  { id: '102', cultura: 'Alface Americana', quantidade: 20 },
  { id: '105', cultura: 'Rúcula', quantidade: 5 }
]);

const mesasAtivas = ref([
  { id: 'M01', cultura: 'Alface Crespa', previsaoColheita: '25/05/2026', progresso: 80 },
  { id: 'M04', cultura: 'Manjericão', previsaoColheita: '15/06/2026', progresso: 45 },
  { id: 'M06', cultura: 'Cebolinha', previsaoColheita: '08/05/2026', progresso: 95 }
]);

const buscarUsuario = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    const response = await fetch('http://127.0.0.1:8000/api/funcionarios/me/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const funcionario = await response.json();
      nomeUsuario.value = funcionario.nome_completo.split(' ')[0]; // Pega só o primeiro nome
    }
  } catch (error) {
    console.error("Erro ao buscar usuário", error);
  }
};

onMounted(() => {
  buscarUsuario();
  // Aqui você chamará as funções para bater nas suas APIs (ex: /api/lotes/, /api/mesas/)
  // e calcular os kpis.mesasOcupadas, lotesAlerta, etc.
});
</script>

<style scoped>
.dashboard-container {
  padding: 10px 40px 40px 40px;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* --- GRID DE KPIs --- */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.kpi-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-5px);
}

.kpi-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.kpi-icon span {
  font-size: 2rem;
}

.kpi-info h3 {
  font-size: 0.9rem;
  color: var(--text-light);
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 5px;
}

.kpi-info h2 {
  font-size: 2rem;
  color: var(--primary-dark);
  font-family: "Poppins", sans-serif;
  line-height: 1;
  margin-bottom: 5px;
}

.kpi-info p {
  font-size: 0.85rem;
  color: #777;
}

/* --- WIDGETS --- */
.dashboard-widgets {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 25px;
}

.widget-card {
  background: var(--white);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(0,0,0,0.05);
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.widget-header h3 {
  font-family: 'Poppins', sans-serif;
  color: var(--primary-green);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary-green);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  color: var(--text-light);
  padding: 20px 0;
  font-style: italic;
}

/* Lista de Alertas */
.alert-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(188, 108, 37, 0.05);
  border: 1px solid rgba(188, 108, 37, 0.2);
  border-radius: 12px;
}

.alert-text {
  display: flex;
  flex-direction: column;
}

.alert-text strong { color: var(--primary-dark); }
.alert-text span { font-size: 0.85rem; color: var(--accent-terracota); }

/* Lista de Cultivos */
.cultivo-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cultivo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #fdfdfd;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 12px;
}

.cultivo-info {
  display: flex;
  flex-direction: column;
  width: 30%;
}

.cultivo-info strong { color: var(--primary-dark); }
.cultivo-info span { font-size: 0.85rem; color: #777; }

.cultivo-status {
  width: 65%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cultivo-status span {
  font-size: 0.85rem;
  color: var(--primary-green);
  font-weight: 600;
  text-align: right;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--primary-green);
  border-radius: 10px;
  transition: width 0.5s ease;
}

@media (max-width: 1024px) {
  .dashboard-widgets { grid-template-columns: 1fr; }
}
</style>
