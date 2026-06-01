<template>
  <Sidebar />

  <main class="main-content">

    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 40px;">
      <DashHeader
        title="Irrigação"
        subtitle="Controle e monitoramento de sistemas de rega por estufa."
      />
      <WeatherWidget v-if="modoSimulacao" style="margin-top: 15px;" />
    </div>

    <section v-if="!modoSimulacao" class="empty-state-section">
      <div class="empty-card">
        <div class="empty-icon-wrapper" style="background: rgba(25, 118, 210, 0.1);">
          <span class="material-symbols-outlined pulse-icon" style="color: #1976d2;">valve</span>
        </div>
        <h2>Aguardando Módulos de Irrigação</h2>
        <p>O painel de controle está pronto, mas nenhuma válvula inteligente foi detectada nas estufas.</p>

        <div class="api-docs">
          <div class="docs-header">
            <span class="material-symbols-outlined">terminal</span> Endpoint de Telemetria (Atuadores / Válvulas)
          </div>
          <div class="docs-body">
            <div class="method-url"><span class="method">POST</span><span class="url">/api/irrigacao/atualizar_status/</span></div>
            <strong>Headers Obrigatórios:</strong>
            <pre><code>Content-Type: application/json
Authorization: Api-Key GT_IOT_SECRET_KEY_2026</code></pre>
            <strong>Payload (JSON):</strong>
            <pre><code>{
  "valvula_id": "VLV-01",
  "mesa_id": 1,
  "status_atual": "ativa",
  "fluxo_l_min": 1.8,
  "consumo_ciclo_l": 14.5
}</code></pre>
          </div>
        </div>

        <button class="btn-ghost" @click="iniciarSimulacao" title="Carregar atuadores virtuais">
          <span class="material-symbols-outlined">science</span> Ativar Modo Simulação
        </button>
      </div>
    </section>

    <div v-else>
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
        <div class="irrig-kpi" style="position: relative;">
          <button class="btn-danger-outline" @click="pararSimulacao" style="position: absolute; right: 15px; top: 20px;">
            <span class="material-symbols-outlined">stop_circle</span> Parar Simulação
          </button>
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
              <ToggleSwitch v-model="v.ativa" @change="toggleValvula(v)" />
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
            <div class="form-group"><label>Horário de Início</label><input type="time" v-model="novoAgend.hora" required /></div>
            <div class="form-group"><label>Duração (minutos)</label><input type="number" v-model="novoAgend.duracao" min="1" max="120" required /></div>
            <div class="form-group">
              <label>Dias da Semana</label>
              <div class="dias-semana">
                <button type="button" v-for="dia in ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']" :key="dia" class="dia-btn" :class="{ active: novoAgend.dias.includes(dia) }" @click="toggleDia(dia)">{{ dia }}</button>
              </div>
            </div>
            <div class="form-group" style="align-self:flex-end;">
              <button type="submit" class="btn-generate"><span class="material-symbols-outlined">add_alarm</span> Salvar Agendamento</button>
            </div>
          </form>

          <div class="agendamentos-lista">
            <div v-if="agendamentosBD.length === 0" style="color:#aaa; text-align:center; padding:20px">Nenhum agendamento cadastrado.</div>
            <div v-else v-for="ag in agendamentosBD" :key="ag.id" class="agend-item">
              <div class="agend-icon"><span class="material-symbols-outlined">event</span></div>
              <div class="agend-info">
                <div class="agend-titulo">{{ ag.estufa }} — {{ ag.hora }} · {{ ag.duracao }} min</div>
                <div class="agend-detalhe">{{ ag.dias.join(", ") }}</div>
              </div>
              <button type="button" class="agend-delete" @click="excluirAgendamento(ag.id)" title="Excluir"><span class="material-symbols-outlined">delete</span></button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <Footer />
  </main>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import DashHeader from "@/components/DashHeader.vue"; // Componente novo
import ToggleSwitch from "@/components/ToggleSwitch.vue"; // Componente novo
import WeatherWidget from "@/components/WeatherWidget.vue";

const modoSimulacao = ref(false);
let simularProgresso = null;

const valvulasBD = ref([
  { id: "VLV-01", nome: "Válvula 1", local: "Estufa 01 — Mesa A", ativa: true,  fluxo: "1.8 L/min", progresso: 65 },
  { id: "VLV-02", nome: "Válvula 2", local: "Estufa 01 — Mesa B", ativa: false, fluxo: "--",       progresso: 0  },
  { id: "VLV-03", nome: "Válvula 3", local: "Estufa 02 — Mesa A", ativa: true,  fluxo: "2.1 L/min", progresso: 40 },
  { id: "VLV-04", nome: "Válvula 4", local: "Estufa 02 — Mesa B", ativa: false, fluxo: "--",       progresso: 0  },
]);

const agendamentosBD = ref([
  { id: 1, estufa: "Estufa 01", hora: "07:00", duracao: 20, dias: ["Seg","Ter","Qua","Qui","Sex"] },
  { id: 2, estufa: "Estufa 02", hora: "18:30", duracao: 15, dias: ["Seg","Qua","Sex"] }
]);

const novoAgend = ref({ estufa: 'Estufa 01', hora: '07:00', duracao: 20, dias: ['Seg','Ter','Qua','Qui','Sex'] });

const totalAtivas = computed(() => valvulasBD.value.filter(v => v.ativa).length);

// Lógica de Simulação Mantida 100% Intacta
const iniciarSimulacao = () => {
  modoSimulacao.value = true;
  simularProgresso = setInterval(() => {
    valvulasBD.value.forEach(v => {
      if (v.ativa) {
        v.progresso = Math.min(100, v.progresso + Math.floor(Math.random() * 3 + 1));
        if (v.progresso >= 100) v.progresso = 0;
      }
    });
  }, 3000);
};

const pararSimulacao = () => {
  modoSimulacao.value = false;
  if (simularProgresso) clearInterval(simularProgresso);
  valvulasBD.value.forEach(v => { v.ativa = false; v.progresso = 0; v.fluxo = "--"; });
};

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
  if (novoAgend.value.dias.length === 0) { alert("Selecione pelo menos um dia."); return; }
  agendamentosBD.value.push({ id: Date.now(), ...novoAgend.value, dias: [...novoAgend.value.dias] });
};

const excluirAgendamento = (id) => {
  if (confirm("Remover este agendamento?")) { agendamentosBD.value = agendamentosBD.value.filter(a => a.id !== id); }
};

onUnmounted(() => { if (simularProgresso) clearInterval(simularProgresso); });
</script>

<style scoped>
/* --- ESTADO VAZIO / API DOCS --- */
.empty-state-section { display: flex; justify-content: center; align-items: center; padding: 40px; }
.empty-card { background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); border-radius: 20px; padding: 50px 40px; max-width: 700px; text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); }
.empty-icon-wrapper { width: 100px; height: 100px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 20px; }
.pulse-icon { font-size: 3.5rem; animation: pulse-slow 2s infinite; }
@keyframes pulse-slow { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
.empty-card h2 { color: var(--primary-green); font-family: 'Poppins', sans-serif; margin-bottom: 10px; font-size: 1.8rem; }
.empty-card p { color: #666; margin-bottom: 30px; }

.api-docs { background: #1e1e1e; border-radius: 12px; text-align: left; overflow: hidden; margin-bottom: 30px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); }
.docs-header { background: #2d2d2d; color: #e0e0e0; padding: 10px 15px; font-size: 0.85rem; font-family: monospace; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #444; }
.docs-body { padding: 20px; }
.method-url { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; font-family: monospace; font-size: 1rem; }
.method { background: #4caf50; color: #111; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }
.url { color: #4db8ff; word-break: break-all; }
.docs-body strong { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
.docs-body pre { margin: 10px 0 20px 0; background: #111; padding: 15px; border-radius: 8px; overflow-x: auto; }
.docs-body code { font-family: 'Consolas', monospace; color: #ce9178; font-size: 0.85rem; }

.btn-ghost { background: transparent; border: 1px solid #ccc; color: #777; padding: 10px 20px; border-radius: 30px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease; }
.btn-ghost:hover { background: rgba(0,0,0,0.05); color: var(--primary-dark); border-color: var(--primary-dark); }
.btn-danger-outline { background: transparent; border: 1px solid #ffcdd2; color: #d32f2f; padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
.btn-danger-outline:hover { background: #ffebee; }

/* --- MÓDULO DE SIMULAÇÃO: IRRIGAÇÃO --- */
.irrig-summary-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 0 40px 30px; }
.irrig-kpi { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; display: flex; align-items: center; gap: 15px; }
.kpi-icon { font-size: 2.5rem; color: var(--primary-green); }
.kpi-value { font-size: 1.5rem; font-weight: 700; color: var(--primary-dark); }
.kpi-label { font-size: 0.85rem; color: #666; }

.irrig-section { padding: 0 40px 40px; }
.section-title { font-size: 1.3rem; color: var(--primary-dark); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
.valvulas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.valvula-card { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; border-left: 5px solid #ccc; transition: 0.3s; }
.valvula-card:has(.toggle-switch input:checked) { border-left-color: var(--primary-green); }
.valvula-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
.valvula-nome { font-weight: 700; font-size: 1.1rem; color: var(--primary-dark); }
.valvula-local { font-size: 0.85rem; color: #666; }
.valvula-progresso { margin-bottom: 15px; }
.valvula-prog-label { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: #555; margin-bottom: 5px; }
.prog-track { height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden; }
.prog-fill { height: 100%; background: var(--primary-green); transition: width 0.5s; }
.valvula-status { display: flex; align-items: center; gap: 5px; font-weight: 600; font-size: 0.9rem; }
.valvula-status.ativa { color: var(--primary-green); }
.valvula-status.inativa { color: #888; }
.valvula-flow { margin-top: 10px; font-size: 0.85rem; color: #1976d2; display: flex; align-items: center; gap: 5px; }

.agendamento-card { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.agendamento-form { display: flex; flex-direction: column; gap: 15px; }
.dias-semana { display: flex; gap: 8px; flex-wrap: wrap; }
.dia-btn { background: rgba(255,255,255,0.6); border: 1px solid var(--glass-border); padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; color: #666; }
.dia-btn.active { background: var(--primary-green); color: white; border-color: var(--primary-green); }
.agendamentos-lista { border-left: 1px solid rgba(0,0,0,0.05); padding-left: 30px; display: flex; flex-direction: column; gap: 10px; }
.agend-item { display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.5); padding: 12px 15px; border-radius: 10px; }
.agend-icon { background: rgba(58,90,64,0.1); color: var(--primary-green); padding: 10px; border-radius: 10px; display: flex; }
.agend-info { flex: 1; }
.agend-titulo { font-weight: 700; color: var(--primary-dark); }
.agend-detalhe { font-size: 0.85rem; color: #666; }
.agend-delete { background: none; border: none; color: #d32f2f; cursor: pointer; opacity: 0.5; transition: 0.3s; }
.agend-delete:hover { opacity: 1; transform: scale(1.1); }

/* Switch de Liga/Desliga */
.toggle-switch { position: relative; display: inline-block; width: 50px; height: 26px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
.toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
.toggle-switch input:checked + .toggle-slider { background-color: var(--primary-green); }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(24px); }

/* Responsividade */
@media (max-width: 992px) { .irrig-summary-bar { grid-template-columns: 1fr 1fr; } }
@media (max-width: 768px) { .agendamento-card { grid-template-columns: 1fr; } }
</style>
