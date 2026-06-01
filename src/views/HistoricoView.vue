<template>
  <Sidebar />
  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Histórico e Auditoria do Sistema</h1>
        <p>Logs cronológicos consolidados das atividades físicas e telemétricas das estufas.</p>
      </div>
    </header>

    <section class="registration-container" style="align-items: flex-start;">
      <div class="form-card" style="max-width: 1100px; width: 100%; padding: 25px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
          <tr style="border-bottom: 2px solid var(--glass-border); color: var(--primary-dark); font-family: 'Poppins', sans-serif;">
            <th style="padding: 15px 10px;">Timestamp</th>
            <th style="padding: 15px 10px;">Subsistema</th>
            <th style="padding: 15px 10px;">Mesa Alvo</th>
            <th style="padding: 15px 10px;">Evento / Telemetria Gravada</th>
            <th style="padding: 15px 10px;">Responsável</th>

          </tr>
          </thead>
          <tbody>
          <tr v-for="log in logsUnificados" :key="log.uid" style="border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.2s;">
            <td style="padding: 15px 10px; color: #666; font-size: 0.9rem; font-family: monospace;">{{ formatarData(log.data) }}</td>
            <td style="padding: 15px 10px;">
                <span
                  class="badge"
                  :style="{
                    background: log.tipo === 'Clima' ? 'rgba(58,90,64,0.1)' : 'rgba(25,118,210,0.1)',
                    color: log.tipo === 'Clima' ? 'var(--primary-green)' : '#1976d2',
                    fontWeight: '700'
                  }"
                >
                  {{ log.tipo }}
                </span>
            </td>
            <td style="padding: 15px 10px; color: var(--primary-dark); font-weight: 600;">ID: {{ log.mesa }}</td>
            <td style="padding: 15px 10px; color: #333; font-size: 0.95rem;">{{ log.descricao }}</td>
          </tr>
          <tr v-if="logsUnificados.length === 0">
            <td colspan="4" style="text-align: center; padding: 40px; color: #aaa; font-style: italic;">Nenhum registro de atividade encontrado nas bases de dados.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>
    <Footer/>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";

const registrosClima = ref([]);
const registrosIrrigacao = ref([]);

const buscarLogsDoBanco = async () => {
  const token = localStorage.getItem('access_token');
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [resClima, resIrrig] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/clima/', { headers }),
      fetch('http://127.0.0.1:8000/api/irrigacao/', { headers })
    ]);

    if (resClima.ok) registrosClima.value = await resClima.ok ? await resClima.json() : [];
    if (resIrrig.ok) registrosIrrigacao.value = await resIrrig.ok ? await resIrrig.json() : [];
  } catch (err) {
    console.error("Erro na carga do log unificado:", err);
  }
};

const logsUnificados = computed(() => {
  const resultado = [];

  // Mapeia registros telemétricos de clima
  registrosClima.value.forEach(c => {
    resultado.push({
      uid: `C-${c.id}`,
      data: c.data_registro,
      tipo: "Clima",
      mesa: c.mesa_id,
      descricao: `Varredura automática: Temp=${c.temperatura}°C | Umid=${c.umidade}% | Lux=${c.luminosidade}% | Ventiladores [Módulo ${c.ventilacao}].`
    });
  });

  // Mapeia registros físicos de atuação de água
  registrosIrrigacao.value.forEach(i => {
    resultado.push({
      uid: `I-${i.id}`,
      data: i.data_registro,
      tipo: "Irrigação",
      mesa: i.mesa_id,
      descricao: `Atuador Solenoide [${i.valvula_id}] alterado para estado de operação: ${i.status_atual.toUpperCase()}. Vazão: ${i.fluxo_l_min} L/min. Consumo do ciclo: ${i.consumo_ciclo_l}L.`
    });
  });

  // decrescente por data (mais recente no topo)
  return resultado.sort((a, b) => new Date(b.data) - new Date(a.data));
});

const formatarData = (stringData) => {
  return new Date(stringData).toLocaleString('pt-BR');
};

onMounted(() => {
  buscarLogsDoBanco();
});
</script>
