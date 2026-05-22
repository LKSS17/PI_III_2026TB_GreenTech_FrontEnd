<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Irrigação 💧</h1>
        <p>Controle e monitoramento de sistemas de rega por estufa.</p>
      </div>
      <WeatherWidget />
    </header>

    <div class="irrig-summary-bar">
      <div class="irrig-kpi">
        <span class="material-symbols-outlined kpi-icon">water_drop</span>
        <div><div class="kpi-value">142 L</div><div class="kpi-label">Consumo hoje</div></div>
      </div>
      <div class="irrig-kpi">
        <span class="material-symbols-outlined kpi-icon" style="color:#1976d2">valve</span>
        <div><div class="kpi-value">{{ totalAtivas }} / {{ valvulasBD.length }}</div><div class="kpi-label">Válvulas ativas</div></div>
      </div>
      <div class="irrig-kpi">
        <span class="material-symbols-outlined kpi-icon" style="color:var(--accent-terracota)">schedule</span>
        <div><div class="kpi-value">15:00</div><div class="kpi-label">Próxima rega</div></div>
      </div>
      <div class="irrig-kpi">
        <span class="material-symbols-outlined kpi-icon" style="color:#2d5a27">eco</span>
        <div><div class="kpi-value">18%</div><div class="kpi-label">Economia vs semana anterior</div></div>
      </div>
    </div>

    <section class="irrig-section">
      <h2 class="section-title"><span class="material-symbols-outlined">valve</span> Controle de Válvulas</h2>
      <div class="valvulas-grid">
        <div v-for="v in valvulasBD" :key="v.id" class="valvula-card">
          <div class="valvula-header">
            <div>
              <div class="valvula-nome">{{ v.nome }} · {{ v.id }}</div>
              <div class="valvula-local">{{ v.local }}</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="v.ativa" @change="toggleValvula(v)">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="valvula-progresso">
            <div class="valvula-prog-label">
              <span>Ciclo atual</span>
              <span>{{ v.progresso }}%</span>
            </div>
            <div class="prog-track">
              <div class="prog-fill" :style="{ width: v.progresso + '%' }"></div>
            </div>
          </div>

          <div class="valvula-status" :class="v.ativa ? 'ativa' : 'inativa'">
            <span class="material-symbols-outlined" style="font-size:0.9rem">{{ v.ativa ? 'water_drop' : 'do_not_disturb' }}</span>
            {{ v.ativa ? 'Irrigando' : 'Inativa' }}
          </div>
          <div v-if="v.ativa" class="valvula-flow">
            <span class="material-symbols-outlined" style="font-size:0.9rem">speed</span> Fluxo: {{ v.fluxo }}
          </div>
        </div>
      </div>
    </section>

    <section class="irrig-section">
      <h2 class="section-title"><span class="material-symbols-outlined">event</span> Agendamento de Rega</h2>
      <div class="agendamento-card">
        <form @submit.prevent="salvarAgendamento" class="agendamento-form">
          <div class="form-group">
            <label>Estufa / Zona</label>
            <select v-model="novoAgend.estufa" required>
              <option value="Estufa 01">Estufa 01</option>
              <option value="Estufa 02">Estufa 02</option>
              <option value="Estufa 03">Estufa 03</option>
            </select>
          </div>
          <div class="form-group">
            <label>Horário de Início</label>
            <input type="time" v-model="novoAgend.hora" required />
          </div>
          <div class="form-group">
            <label>Duração (minutos)</label>
            <input type="number" v-model="novoAgend.duracao" min="1" max="120" required />
          </div>
          <div class="form-group">
            <label>Dias da Semana</label>
            <div class="dias-semana">
              <button
                type="button"
                v-for="dia in ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']"
                :key="dia"
                class="dia-btn"
                :class="{ active: novoAgend.dias.includes(dia) }"
                @click="toggleDia(dia)"
              >{{ dia }}</button>
            </div>
          </div>
          <div class="form-group" style="align-self:flex-end;">
            <button type="submit" class="btn-generate">
              <span class="material-symbols-outlined">add_alarm</span> Salvar Agendamento
            </button>
          </div>
        </form>

        <div class="agendamentos-lista">
          <div v-if="agendamentosBD.length === 0" style="color:#aaa; text-align:center; padding:20px">Nenhum agendamento cadastrado.</div>
          <div v-else v-for="ag in agendamentosBD" :key="ag.id" class="agend-item">
            <div class="agend-icon">
              <span class="material-symbols-outlined">event</span>
            </div>
            <div class="agend-info">
              <div class="agend-titulo">{{ ag.estufa }} — {{ ag.hora }} · {{ ag.duracao }} min</div>
              <div class="agend-detalhe">{{ ag.dias.join(", ") }}</div>
            </div>
            <button type="button" class="agend-delete" @click="excluirAgendamento(ag.id)" title="Excluir">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
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

const valvulasBD = ref([
  { id: "VLV-01", nome: "Válvula 1", local: "Estufa 01 — Mesa A", ativa: true,  fluxo: "1.8 L/min", progresso: 65 },
  { id: "VLV-02", nome: "Válvula 2", local: "Estufa 01 — Mesa B", ativa: false, fluxo: "--",       progresso: 0  },
  { id: "VLV-03", nome: "Válvula 3", local: "Estufa 02 — Mesa A", ativa: true,  fluxo: "2.1 L/min", progresso: 40 },
]);

const agendamentosBD = ref([
  { id: 1, estufa: "Estufa 01", hora: "07:00", duracao: 20, dias: ["Seg","Ter","Qua","Qui","Sex"] }
]);

const novoAgend = ref({
  estufa: 'Estufa 01',
  hora: '07:00',
  duracao: 20,
  dias: ['Seg','Ter','Qua','Qui','Sex']
});

const totalAtivas = computed(() => valvulasBD.value.filter(v => v.ativa).length);

const toggleValvula = (v) => {
  v.fluxo = v.ativa ? "1.8 L/min" : "--";
  v.progresso = 0;
};

const toggleDia = (dia) => {
  const index = novoAgend.value.dias.indexOf(dia);
  if (index === -1) novoAgend.value.dias.push(dia);
  else novoAgend.value.dias.splice(index, 1);
};

const salvarAgendamento = () => {
  if (novoAgend.value.dias.length === 0) {
    alert("Selecione pelo menos um dia.");
    return;
  }
  agendamentosBD.value.push({ id: Date.now(), ...novoAgend.value, dias: [...novoAgend.value.dias] });
  alert(`Agendamento salvo!`);
};

const excluirAgendamento = (id) => {
  if (confirm("Remover este agendamento?")) {
    agendamentosBD.value = agendamentosBD.value.filter(a => a.id !== id);
  }
};

let simularProgresso;
onMounted(() => {
  simularProgresso = setInterval(() => {
    valvulasBD.value.forEach(v => {
      if (v.ativa) {
        v.progresso = Math.min(100, v.progresso + Math.floor(Math.random() * 3 + 1));
        if (v.progresso >= 100) v.progresso = 0;
      }
    });
  }, 5000);
});
onUnmounted(() => clearInterval(simularProgresso));
</script>
