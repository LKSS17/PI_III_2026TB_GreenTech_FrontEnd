<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Painel Geral</h1>
        <p>Bem-vindo. Aqui está o resumo em tempo real da sua produção agrícola.</p>
      </div>
      <WeatherWidget />
    </header>

    <section class="dashboard-container" style="padding: 10px 40px 40px 40px; display: flex; flex-direction: column; gap: 30px;">

      <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
        <div class="kpi-card" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px;">
          <div class="kpi-icon" style="background: rgba(76, 175, 80, 0.1); color: #4CAF50; width: 60px; height: 60px; border-radius: 15px; display: flex; justify-content: center; align-items: center;">
            <span class="material-symbols-outlined" style="font-size: 2rem;">grid_view</span>
          </div>
          <div class="kpi-info">
            <h3 style="font-size: 0.9rem; color: #666; text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">Mesas Ocupadas</h3>
            <h2 style="font-size: 2rem; color: var(--primary-dark); line-height: 1;">{{ kpis.mesasOcupadas }} / {{ kpis.mesasTotais }}</h2>
            <p style="font-size: 0.85rem; color: #777;">Ocupação espacial ativa</p>
          </div>
        </div>

        <div class="kpi-card" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px;">
          <div class="kpi-icon" style="background: rgba(58, 90, 64, 0.1); color: var(--primary-green); width: 60px; height: 60px; border-radius: 15px; display: flex; justify-content: center; align-items: center;">
            <span class="material-symbols-outlined" style="font-size: 2rem;">local_florist</span>
          </div>
          <div class="kpi-info">
            <h3 style="font-size: 0.9rem; color: #666; text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">Tubetes em Estoque</h3>
            <h2 style="font-size: 2rem; color: var(--primary-dark); line-height: 1;">{{ kpis.tubetesDisponiveis }}</h2>
            <p style="font-size: 0.85rem; color: #777;">Mudas prontas para mesa</p>
          </div>
        </div>

        <div class="kpi-card" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px;">
          <div class="kpi-icon" style="background: rgba(188, 108, 37, 0.1); color: var(--accent-terracota); width: 60px; height: 60px; border-radius: 15px; display: flex; justify-content: center; align-items: center;">
            <span class="material-symbols-outlined" style="font-size: 2rem;">water_drop</span>
          </div>
          <div class="kpi-info">
            <h3 style="font-size: 0.9rem; color: #666; text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">Rega Ativa</h3>
            <h2 style="font-size: 2rem; color: var(--primary-dark); line-height: 1;">{{ kpis.valvulasAtivas }}</h2>
            <p style="font-size: 0.85rem; color: #777;">Sistemas gotejando agora</p>
          </div>
        </div>
      </div>

      <div class="dashboard-widgets" style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
        <div class="widget-card" style="background: white; border: 1px solid var(--glass-border); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <h3 style="color: var(--primary-green); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;"><span class="material-symbols-outlined">psychiatry</span> Alocações de Lotes Ativas</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 15px;">
            <li v-for="lote in lotesAtivos" :key="lote.id" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #fdfdfd; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px;">
              <div>
                <strong style="color: var(--primary-dark);">LOTE #{{ lote.id }}</strong>
                <div style="font-size: 0.85rem; color: #777;">Cultura ID: {{ lote.cultura_id }} · Mesa ID: {{ lote.mesa_id }}</div>
              </div>
              <span class="badge badge-good" style="padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: rgba(76,175,80,0.15); color: #2d5a27;">{{ lote.status }}</span>
            </li>
            <li v-if="lotesAtivos.length === 0" style="text-align: center; color: #aaa; padding: 20px; font-style: italic;">Nenhum lote em desenvolvimento no momento.</li>
          </ul>
        </div>

        <div class="widget-card" style="background: white; border: 1px solid var(--glass-border); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <h3 style="color: var(--primary-green); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;"><span class="material-symbols-outlined">monitoring</span> Últimas Leituras de Clima</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 15px;">
            <li v-for="clima in ultimasLeituras" :key="clima.id" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #fdfdfd; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px;">
              <div>
                <strong style="color: var(--primary-dark);">Mesa {{ clima.mesa_id }}</strong>
                <div style="font-size: 0.85rem; color: #777;">Luminosidade: {{ clima.luminosidade }}%</div>
              </div>
              <div style="text-align: right; font-weight: 600; color: var(--primary-green);">
                <div>{{ clima.temperatura }}°C</div>
                <div style="font-size: 0.8rem; color: #1976d2;">{{ clima.umidade }}% UR</div>
              </div>
            </li>
            <li v-if="ultimasLeituras.length === 0" style="text-align: center; color: #aaa; padding: 20px; font-style: italic;">Nenhuma telemetria recebida dos sensores ainda.</li>
          </ul>
        </div>
      </div>
    </section>

    <Footer />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";

const kpis = ref({ mesasOcupadas: 0, mesasTotais: 0, tubetesDisponiveis: 0, valvulasAtivas: 0 });
const lotesAtivos = ref([]);
const ultimasLeituras = ref([]);

const carregarPainelGeral = async () => {
  const token = localStorage.getItem('access_token');
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [resMesas, resLotes, resClima, resIrrigacao] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/mesas/', { headers }),
      fetch('http://127.0.0.1:8000/api/lotes/', { headers }),
      fetch('http://127.0.0.1:8000/api/clima/', { headers }),
      fetch('http://127.0.0.1:8000/api/irrigacao/', { headers })
    ]);

    if (resMesas.ok) {
      const mesas = await resMesas.json();
      kpis.value.mesasTotais = mesas.length;
    }

    if (resLotes.ok) {
      const lotes = await resLotes.json();
      lotesAtivos.value = lotes.slice(0, 5);
      kpis.value.mesasOcupadas = lotes.filter(l => l.status === 'AT' || l.status === 'DI').length;
      kpis.value.tubetesDisponiveis = lotes.reduce((acc, curr) => acc + (parseInt(curr.quantidade) || 0), 0);
    }

    if (resClima.ok) {
      const climas = await resClima.json();
      ultimasLeituras.value = climas.slice(-5).reverse();
    }

    if (resIrrigacao.ok) {
      const irrigacoes = await resIrrigacao.json();
      kpis.value.valvulasAtivas = irrigacoes.filter(i => i.status_atual === 'ativa').length;
    }
  } catch (err) {
    console.error("Erro ao processar dados do Dashboard:", err);
  }
};

onMounted(() => {
  carregarPainelGeral();
});
</script>
