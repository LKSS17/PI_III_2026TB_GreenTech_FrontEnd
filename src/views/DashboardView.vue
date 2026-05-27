<template>
  <Sidebar />
  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Painel Geral</h1>
        <p>Visão estratégica da infraestrutura, produção e próximas colheitas.</p>
      </div>
      <WeatherWidget />
    </header>

    <section style="display: flex; flex-direction: column; gap: 30px; padding: 20px 40px; width: 100%; max-width: 1400px; margin: 0 auto;">

      <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; width: 100%; max-width: 1200px; margin-bottom: 25px;">

        <div class="sensor-card kpi-card">
          <div class="kpi-icon" style="background: rgba(76, 175, 80, 0.1); color: var(--primary-green);"><span class="material-symbols-outlined">psychiatry</span></div>
          <div class="kpi-data">
            <h3>{{ lotesAtivos }}</h3>
            <p>Lotes em Cultivo</p>
          </div>
        </div>

        <div class="sensor-card kpi-card">
          <div class="kpi-icon" style="background: rgba(2, 136, 209, 0.1); color: #0288d1;"><span class="material-symbols-outlined">view_in_ar</span></div>
          <div class="kpi-data">
            <h3>{{ estufas.length }}</h3>
            <p>Estufas Ativas</p>
          </div>
        </div>

        <div class="sensor-card kpi-card">
          <div class="kpi-icon" style="background: rgba(230, 81, 0, 0.1); color: #e65100;"><span class="material-symbols-outlined">layers</span></div>
          <div class="kpi-data">
            <h3>{{ mesas.length }}</h3>
            <p>Mesas Alocadas</p>
          </div>
        </div>

        <div class="sensor-card kpi-card">
          <div class="kpi-icon" style="background: rgba(103, 58, 183, 0.1); color: #673ab7;"><span class="material-symbols-outlined">speed</span></div>
          <div class="kpi-data">
            <h3>{{ capacidadeTotal }}</h3>
            <p>Capacidade de Tubetes</p>
          </div>
        </div>

      </div>

      <div class="telemetry-grid">

        <div class="sensor-card">
          <h3 style="color: var(--primary-dark); margin-bottom: 15px; display: flex; align-items: center; gap: 8px; font-size: 1.1rem;">
            <span class="material-symbols-outlined" style="color: var(--primary-green);">alarm</span> Maturação e Colheitas
          </h3>

          <div v-if="lotesMaisProximosColheita.length === 0" style="color: #999; font-style: italic; padding: 10px; text-align: center;">
            Nenhum lote em maturação no momento.
          </div>

          <div v-else style="display: flex; flex-direction: column; gap: 18px;">
            <div v-for="l in lotesMaisProximosColheita" :key="l.id" style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 700; color: #444;">
                <span>LOTE #{{ l.id }} — {{ l.nomeCultura }}</span>
                <span :style="{ color: l.porcentagem >= 90 ? '#e65100' : 'var(--primary-green)' }">{{ l.porcentagem }}%</span>
              </div>

              <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; transition: width 0.5s ease-in-out;" :style="{ width: l.porcentagem + '%', background: l.porcentagem >= 90 ? '#e65100' : 'var(--primary-green)' }"></div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #777;">
                <span>Mesa {{ l.mesa_id }} | Vol: {{ parseFloat(l.quantidade) }}</span>
                <span v-if="l.diasRestantes > 0" style="font-weight: 600;">Tempo Extimado: {{ l.diasRestantes }} dias</span>
                <span v-else style="color: #d32f2f; font-weight: 700;">Colheita Pendente</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sensor-card">
          <h3 style="color: var(--primary-dark); margin-bottom: 15px; display: flex; align-items: center; gap: 8px; font-size: 1.1rem;">
            <span class="material-symbols-outlined" style="color: #0288d1;">history</span> Atividades Recentes
          </h3>

          <div v-if="movimentacoesRecentes.length === 0" style="color: #999; font-style: italic; padding: 10px; text-align: center;">
            Sem movimentações recentes registradas.
          </div>

          <div v-else style="display: flex; flex-direction: column; gap: 12px;">
            <div v-for="m in movimentacoesRecentes" :key="m.id" style="display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.04);">

              <div style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"
                   :style="{ background: m.tipo_movimentacao.toLowerCase() === 'entrada' ? '#e8f5e9' : '#ffebee', color: m.tipo_movimentacao.toLowerCase() === 'entrada' ? '#2e7d32' : '#c62828' }">
                <span class="material-symbols-outlined" style="font-size: 1.2rem;">
                  {{ m.tipo_movimentacao.toLowerCase() === 'entrada' ? 'arrow_downward' : 'arrow_upward' }}
                </span>
              </div>

              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary-dark);">Lote #{{ m.lote_id }} — {{ m.motivo }}</div>
                <div style="font-size: 0.75rem; color: #888;">{{ new Date(m.data_movimentacao).toLocaleString('pt-BR') }}</div>
              </div>

              <div style="font-weight: bold; font-size: 1rem;" :style="{ color: m.tipo_movimentacao.toLowerCase() === 'entrada' ? '#2e7d32' : '#c62828' }">
                {{ m.tipo_movimentacao.toLowerCase() === 'entrada' ? '+' : '-' }}{{ parseFloat(m.quantidade) }}
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: auto; padding-top: 15px;">
            <router-link to="/estoque" style="font-size: 0.85rem; color: var(--primary-green); font-weight: 600; text-decoration: none;">Ver Histórico Completo &rarr;</router-link>
          </div>
        </div>

      </div>
    </section>
    <Footer />
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from '@/components/Footer.vue';
import WeatherWidget from '@/components/WeatherWidget.vue';

const lotes = ref([]);
const culturas = ref([]);
const estufas = ref([]);
const mesas = ref([]);
const estoque = ref([]);

// KPIs
const lotesAtivos = computed(() => lotes.value.filter(l => l.status !== 'CO' && l.status !== 'PE').length);
const capacidadeTotal = computed(() => mesas.value.reduce((acc, m) => acc + parseFloat(m.capacidade_maxima || 0), 0));

// Mini-feed de atividades (Pega as 4 últimas movimentações)
const movimentacoesRecentes = computed(() => estoque.value.slice(0, 4));

// Lotes Mais Próximos da Colheita
const lotesMaisProximosColheita = computed(() => {
  return lotes.value
    .filter(l => l.status !== 'CO' && l.status !== 'PE')
    .map(lote => {
      const cultura = culturas.value.find(c => c.id === lote.cultura_id);
      if (!cultura) return null;
      const diasPassados = Math.max(0, Math.floor((new Date() - new Date(lote.data_plantio)) / (1000 * 60 * 60 * 24)));
      const porcentagem = Math.min(100, Math.max(0, Math.round((diasPassados / cultura.tempo_medio_colheita) * 100)));
      const diasRestantes = Math.max(0, cultura.tempo_medio_colheita - diasPassados);
      return { ...lote, nomeCultura: cultura.nome_cultura, porcentagem, diasRestantes };
    })
    .filter(item => item !== null)
    .sort((a, b) => b.porcentagem - a.porcentagem)
    .slice(0, 4); // Exibe os 4 mais urgentes
});

onMounted(async () => {
  const h = { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` };
  try {
    const [resLotes, resCulturas, resEstufas, resMesas, resEstoque] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/lotes/', { headers: h }),
      fetch('http://127.0.0.1:8000/api/cultura/', { headers: h }),
      fetch('http://127.0.0.1:8000/api/estufa/', { headers: h }),
      fetch('http://127.0.0.1:8000/api/mesa/', { headers: h }),
      fetch('http://127.0.0.1:8000/api/estoque/', { headers: h })
    ]);

    if (resLotes.ok) lotes.value = await resLotes.json();
    if (resCulturas.ok) culturas.value = await resCulturas.json();
    if (resEstufas.ok) estufas.value = await resEstufas.json();
    if (resMesas.ok) mesas.value = await resMesas.json();
    if (resEstoque.ok) estoque.value = await resEstoque.json();
  } catch (e) {
    console.error("Erro ao carregar dados do Dashboard:", e);
  }
});
</script>

<style scoped>
/* Grid da parte de baixo */
.telemetry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  width: 100%;
  max-width: 1200px;
}

/* Card Padrão (Glassmorphism) */
.sensor-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sensor-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-green);
}

/* Estilo específico para os cards KPI (Top Row) */
.kpi-card {
  flex-direction: row;
  align-items: center;
  padding: 20px;
  gap: 15px;
}

.kpi-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon span {
  font-size: 1.8rem;
}

.kpi-data h3 {
  font-size: 1.8rem;
  color: var(--primary-dark);
  margin: 0;
  line-height: 1;
}

.kpi-data p {
  color: #666;
  font-size: 0.85rem;
  margin: 5px 0 0 0;
  font-weight: 500;
}
</style>
