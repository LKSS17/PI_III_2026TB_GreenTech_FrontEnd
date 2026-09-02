<template>
  <Sidebar />
  <main class="main-content">
    <DashHeader
      title="Central de Alertas Real-Time"
      subtitle="Notificações automáticas calculadas diretamente das leituras dos sensores IoT."
    />

    <section class="registration-container" style="align-items: flex-start;">
      <div class="form-card" style="max-width: 1000px; width: 100%;">

        <div v-if="alertasCalculados.length === 0" style="text-align: center; color: #888; padding: 40px 0;">
          <span class="material-symbols-outlined" style="font-size: 4rem; color: #4CAF50;">check_circle</span>
          <p style="margin-top: 15px; font-weight: 600; font-size: 1.1rem; color: var(--primary-dark);">Nenhum alerta registrado.</p>
        </div>

        <div v-else class="agendamentos-lista" style="border: none; padding: 0; display: flex; flex-direction: column; gap: 15px;">
          <div
            v-for="alerta in alertasCalculados"
            :key="alerta.id"
            class="agend-item"
            :style="{ borderLeft: '6px solid ' + alerta.cor, background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 20 }"
          >
            <div class="agend-icon" :style="{ background: alerta.fundo, color: alerta.cor, padding: '12px', borderRadius: '10px', display: 'flex' }">
              <span class="material-symbols-outlined">{{ alerta.icone }}</span>
            </div>

            <div class="agend-info" style="flex: 1;">
              <div class="agend-titulo" style="font-weight: 700; font-size: 1.1rem; color: var(--primary-dark);">
                Mesa {{ alerta.mesa_id }} · Estufas {{ alerta.tipo }}
              </div>
              <div class="agend-detalhe" style="color: #555; margin-top: 4px;">{{ alerta.mensagem }}</div>
              <div class="agend-detalhe" style="font-size: 0.8rem; color: #999; margin-top: 6px; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 1rem;">schedule</span>
                {{ formatarData(alerta.timestamp) }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
    <Footer/>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import DashHeader from "@/components/DashHeader.vue";

const leiturasClima = ref([]);

const carregarDadosSensores = async () => {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch('/api/clima/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      leiturasClima.value = await res.json();
    }
  } catch (err) {
    console.error("Erro de comunicação com o servidor de telemetria:", err);
  }
};

const alertasCalculados = computed(() => {
  const listaAlertas = [];

  // Analisa as leituras para identificar anomalias (Regras de Negócio Agrícola)
  leiturasClima.value.forEach((leitura) => {
    const temp = parseFloat(leitura.temperatura);
    const umid = parseFloat(leitura.umidade);

    if (temp > 30.0) {
      listaAlertas.push({
        id: `T-HIGH-${leitura.id}`,
        mesa_id: leitura.mesa_id,
        tipo: "Temperatura Crítica",
        mensagem: `Limite térmico excedido. Registrado: ${temp}°C (Máximo ideal: 30°C). Ativar exaustores imediatamente.`,
        timestamp: leitura.data_registro,
        icone: "device_thermostat",
        cor: "#d32f2f",
        fundo: "#ffebee"
      });
    } else if (temp < 16.0) {
      listaAlertas.push({
        id: `T-LOW-${leitura.id}`,
        mesa_id: leitura.mesa_id,
        tipo: "Temperatura Baixa",
        mensagem: `Estresse térmico por frio detectado. Registrado: ${temp}°C.`,
        timestamp: leitura.data_registro,
        icone: "ac_unit",
        cor: "#1976d2",
        fundo: "#e3f2fd"
      });
    }

    if (umid < 50.0) {
      listaAlertas.push({
        id: `H-LOW-${leitura.id}`,
        mesa_id: leitura.mesa_id,
        tipo: "Déficit de Umidade",
        mensagem: `Ar extremamente seco na bancada. Registrado: ${umid}% UR. Risco de desidratação foliar dos tubetes.`,
        timestamp: leitura.data_registro,
        icone: "humidity_low",
        cor: "#bc6c25",
        fundo: "#fdf6ec"
      });
    }
  });

  // Retorna os mais recentes primeiro
  return listaAlertas.reverse().slice(0, 15);
});

const formatarData = (stringData) => {
  const d = new Date(stringData);
  return d.toLocaleString('pt-BR');
};

onMounted(() => {
  carregarDadosSensores();
});
</script>
