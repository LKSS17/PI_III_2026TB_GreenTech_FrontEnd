<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Sensores IoT 📡</h1>
        <p>Monitoramento em tempo real de temperatura, umidade e luminosidade das estufas.</p>
      </div>
      <WeatherWidget />
    </header>

    <div class="sensores-status-bar">
      <div class="status-pill status-online">
        <span class="material-symbols-outlined">wifi</span>
        <span>{{ kpis.online }} sensores online</span>
      </div>
      <div class="status-pill status-alert">
        <span class="material-symbols-outlined">warning</span>
        <span>{{ kpis.alerta }} alerta ativo</span>
      </div>
      <div class="status-pill status-offline">
        <span class="material-symbols-outlined">wifi_off</span>
        <span>{{ kpis.offline }} offline</span>
      </div>
      <button class="btn-refresh" @click="atualizarSensores">
        <span class="material-symbols-outlined" :class="{ 'spinning': atualizando }">refresh</span>
        Atualizar
      </button>
    </div>

    <section class="sensores-grid-container">
      <div class="sensores-grid">
        <div v-for="s in sensoresBD" :key="s.id" class="sensor-card" :class="s.status">
          <div class="sensor-card-header">
            <div>
              <div class="sensor-card-title">{{ s.id }} · {{ s.nome }}</div>
              <div class="sensor-card-location">
                <span class="material-symbols-outlined" style="font-size:0.85rem;vertical-align:middle;">location_on</span>
                {{ s.local }}
              </div>
            </div>
            <div class="sensor-status-dot"></div>
          </div>

          <div class="sensor-readings">
            <div class="reading-item">
              <span class="material-symbols-outlined reading-icon" :style="{ color: corTemperatura(s) }">thermostat</span>
              <span class="reading-value" :style="{ color: corTemperatura(s) }">{{ s.status === 'offline' ? '--' : s.temp + '°C' }}</span>
              <span class="reading-label">Temperatura</span>
            </div>
            <div class="reading-item">
              <span class="material-symbols-outlined reading-icon" style="color:#1976d2">humidity_mid</span>
              <span class="reading-value">{{ s.status === 'offline' ? '--' : s.umidade + '%' }}</span>
              <span class="reading-label">Umidade</span>
            </div>
            <div class="reading-item full">
              <span class="material-symbols-outlined reading-icon">light_mode</span>
              <div class="lux-bar-track">
                <div class="lux-bar-fill" :style="{ width: s.status === 'offline' ? '0%' : s.luminosidade + '%' }"></div>
              </div>
              <span class="reading-value">{{ s.status === 'offline' ? '0' : s.luminosidade }}%</span>
            </div>
          </div>

          <div class="sensor-card-footer">
            <span class="material-symbols-outlined">schedule</span>
            Atualizado {{ s.atualizadoEm }}
          </div>
        </div>
      </div>
    </section>

    <section class="historico-container">
      <div class="historico-card">
        <div class="historico-header">
          <h3><span class="material-symbols-outlined">show_chart</span> Histórico — Temperatura (últimas 12h)</h3>
          <select v-model="estufaSelecionadaGrafico">
            <option value="Estufa 01">Estufa 01</option>
            <option value="Estufa 02">Estufa 02</option>
            <option value="Estufa 03">Estufa 03</option>
          </select>
        </div>
        <div class="grafico-wrapper">
          <div v-html="svgGraficoGerado" style="width:100%; height:160px;"></div>
        </div>
      </div>
    </section>

    <Footer />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";

const atualizando = ref(false);

const sensoresBD = ref([
  { id: "SNS-T01", nome: "Sensor Temp/Umid", local: "Estufa 01 — Mesa A", status: "online", temp: 24.3, umidade: 68, luminosidade: 72, atualizadoEm: "há 30 segundos" },
  { id: "SNS-T02", nome: "Sensor Temp/Umid", local: "Estufa 01 — Mesa B", status: "alerta", temp: 31.8, umidade: 55, luminosidade: 85, atualizadoEm: "há 1 minuto" },
  { id: "SNS-T03", nome: "Sensor Temp/Umid", local: "Estufa 02 — Mesa A", status: "online", temp: 22.1, umidade: 74, luminosidade: 60, atualizadoEm: "há 45 segundos" },
  { id: "SNS-T09", nome: "Sensor Externo", local: "Área Externa", status: "offline", temp: "--", umidade: "--", luminosidade: 0, atualizadoEm: "sem sinal" }
]);

const kpis = computed(() => {
  return {
    online: sensoresBD.value.filter(s => s.status === 'online').length,
    alerta: sensoresBD.value.filter(s => s.status === 'alerta').length,
    offline: sensoresBD.value.filter(s => s.status === 'offline').length
  }
});

const corTemperatura = (s) => {
  if (s.status === 'offline' || typeof s.temp !== 'number') return 'var(--primary-dark)';
  if (s.temp > 30) return '#d32f2f';
  if (s.temp > 27) return 'var(--accent-terracota)';
  return 'var(--primary-dark)';
};

const atualizarSensores = () => {
  atualizando.value = true;
  setTimeout(() => {
    sensoresBD.value.forEach((s) => {
      if (s.status !== "offline" && typeof s.temp === "number") {
        s.temp = parseFloat((s.temp + (Math.random() - 0.5) * 0.4).toFixed(1));
        s.umidade = Math.min(99, Math.max(40, Math.round(s.umidade + (Math.random() - 0.5) * 2)));
        s.luminosidade = Math.min(100, Math.max(0, Math.round(s.luminosidade + (Math.random() - 0.5) * 3)));
        s.atualizadoEm = "agora mesmo";
      }
    });
    atualizando.value = false;
  }, 700);
};

// Gráfico Lógica
const estufaSelecionadaGrafico = ref('Estufa 01');
const dadosHistorico = {
  "Estufa 01": [23, 24, 25, 26, 27, 31, 30, 28, 26, 25, 24, 24],
  "Estufa 02": [22, 22, 23, 23, 24, 24, 23, 23, 22, 22, 21, 22],
  "Estufa 03": [21, 22, 23, 24, 25, 25, 24, 23, 22, 21, 21, 22],
};
const horasLabels = ["00h", "02h", "04h", "06h", "08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];

const svgGraficoGerado = computed(() => {
  const dados = dadosHistorico[estufaSelecionadaGrafico.value] || [];
  const W = 800, H = 160;
  const padL = 40, padR = 20, padT = 15, padB = 30;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const minV = Math.min(...dados) - 2;
  const maxV = Math.max(...dados) + 2;
  const range = maxV - minV;

  const px = (i) => padL + (i / (dados.length - 1)) * innerW;
  const py = (v) => padT + innerH - ((v - minV) / range) * innerH;

  const linePath = dados.map((v, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L ${px(dados.length - 1).toFixed(1)} ${(padT + innerH).toFixed(1)} L ${padL} ${(padT + innerH).toFixed(1)} Z`;

  const gridLines = [20, 22, 24, 26, 28, 30, 32].filter(v => v >= minV && v <= maxV).map(v => `
      <line x1="${padL}" y1="${py(v).toFixed(1)}" x2="${W - padR}" y2="${py(v).toFixed(1)}" stroke="rgba(0,0,0,0.07)" stroke-dasharray="4,4" />
      <text x="${padL - 5}" y="${py(v).toFixed(1) + 4}" text-anchor="end" font-size="10" fill="#aaa">${v}°</text>
  `).join("");

  const xLabels = horasLabels.map((h, i) => `
      <text x="${px(i).toFixed(1)}" y="${H - 5}" text-anchor="middle" font-size="10" fill="#aaa">${h}</text>
  `).join("");

  const pontos = dados.map((v, i) => `
      <circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="5" fill="var(--primary-green)" stroke="white" stroke-width="2">
          <title>${horasLabels[i]}: ${v}°C</title>
      </circle>
  `).join("");

  return `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="var(--primary-green)" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="var(--primary-green)" stop-opacity="0.02"/>
              </linearGradient>
          </defs>
          ${gridLines}
          ${xLabels}
          <path d="${areaPath}" fill="url(#areaGrad)" />
          <path d="${linePath}" fill="none" stroke="var(--primary-green)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
          ${pontos}
      </svg>
  `;
});

let intervaloRelogio;
onMounted(() => {
  intervaloRelogio = setInterval(atualizarSensores, 30000);
});
onUnmounted(() => {
  clearInterval(intervaloRelogio);
});
</script>
