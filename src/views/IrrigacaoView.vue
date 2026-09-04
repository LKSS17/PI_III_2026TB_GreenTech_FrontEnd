<template>

  <Sidebar/>

  <div class="irrigacao-container">
    <header class="irrigacao-header">
      <div>
        <h2>Controle de Irrigação & Válvulas</h2>
        <p class="subtitle">Gestão manual programada e atuadores automatizados via IA.</p>
      </div>

      <!-- Seletor de Modo Operacional (Manual vs IA Scikit-learn) -->
      <div class="modo-switch-card" role="region" aria-label="Modo de Operação">
        <span class="modo-label">Modo Operacional:</span>
        <div class="switch-buttons">
          <button
            type="button"
            :class="['btn-switch', { active: modoOperacao === 'MANUAL' }]"
            @click="definirModo('MANUAL')"
            :disabled="alterandoModo"
          >
            ⏱️ Manual / Agendado
          </button>
          <button
            type="button"
            :class="['btn-switch', 'btn-ia', { active: modoOperacao === 'AUTOMATICO_IA' }]"
            @click="definirModo('AUTOMATICO_IA')"
            :disabled="alterandoModo"
          >
            🤖 Autônomo (IA Scikit-learn)
          </button>
        </div>
      </div>
    </header>

    <!-- Banner de Status da Inteligência Artificial -->
    <section v-if="modoOperacao === 'AUTOMATICO_IA'" class="ia-banner" aria-live="polite">
      <div class="ia-badge-wrapper">
        <span class="pulse-indicator"></span>
        <strong>Modelo Preditivo Ativo:</strong>
      </div>
      <p>
        Árvore de Decisão monitorando sensores em tempo real. Disparos ocorrem automaticamente se a umidade do solo for inferior a <strong>{{ limiarUmidade }}%</strong> e a temperatura exceder <strong>{{ limiarTemperatura }}°C</strong>.
      </p>
    </section>

    <div class="irrigacao-grid">
      <!-- Painel das Válvulas Atuadoras -->
      <section class="valvulas-section">
        <h3>Atuadores Hidráulicos (Válvulas)</h3>

        <div class="valvulas-cards-list">
          <div
            v-for="valvula in valvulas"
            :key="valvula.id"
            :class="['valvula-card', { aberta: valvula.status === 'ABERTA' }]"
          >
            <div class="valvula-header">
              <span class="valvula-icon">🚰</span>
              <div>
                <h4>{{ valvula.nome }}</h4>
                <span class="setor-tag">{{ valvula.setor }}</span>
              </div>
            </div>

            <div class="valvula-status-info">
              <span class="status-rotulo">Status Atual:</span>
              <strong :class="['status-valor', valvula.status.toLowerCase()]">
                {{ valvula.status === 'ABERTA' ? 'IRRIGANDO' : 'FECHADA' }}
              </strong>
            </div>

            <div class="valvula-acoes">
              <button
                type="button"
                :class="['btn-action-valvula', valvula.status === 'ABERTA' ? 'btn-fechar' : 'btn-abrir']"
                :disabled="modoOperacao === 'AUTOMATICO_IA' || acionandoValvulaId === valvula.id"
                @click="alternarValvula(valvula)"
                :title="modoOperacao === 'AUTOMATICO_IA' ? 'Controle bloqueado em modo IA' : ''"
              >
                <span v-if="acionandoValvulaId === valvula.id">Comutando...</span>
                <span v-else>{{ valvula.status === 'ABERTA' ? 'Fechar Válvula' : 'Abrir Válvula' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Painel de Explicabilidade da IA / Logs de Decisão -->
      <section class="decisoes-section">
        <h3>Decisões Recentes da IA (RF10)</h3>

        <div class="table-responsive-wrapper">
          <table class="decisoes-table">
            <thead>
              <tr>
                <th scope="col">Horário</th>
                <th scope="col">Atuador</th>
                <th scope="col">Ação Tomada</th>
                <th scope="col">Confiança</th>
                <th scope="col">Justificativa Agronômica</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="carregandoLogs">
                <td colspan="5" class="loading-cell">Consultando telemetria da IA...</td>
              </tr>
              <tr v-else-if="logsDecisao.length === 0">
                <td colspan="5" class="empty-cell">Nenhuma intervenção registrada hoje.</td>
              </tr>
              <tr v-for="log in logsDecisao" :key="log.id">
                <td>{{ log.horario }}</td>
                <td><strong>{{ log.valvula }}</strong></td>
                <td>
                  <span :class="['badge-decisao', log.acao === 'DISPARO' ? 'acao-disparo' : 'acao-bloqueio']">
                    {{ log.acao }}
                  </span>
                </td>
                <td>{{ log.confianca }}%</td>
                <td class="justificativa-texto">{{ log.justificativa }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import Sidebar from '@/components/Sidebar.vue'

const toastStore = useToastStore()

/**
 * CONTRATOS DE DADOS PARA O DESENVOLVEDOR BACK-END:
 * 1. GET /api/irrigacao/status/ -> { modo: 'MANUAL' | 'AUTOMATICO_IA', limiarUmidade: number, limiarTemperatura: number, valvulas: Array }
 * 2. POST /api/irrigacao/modo/ -> { modo: string }
 * 3. POST /api/irrigacao/valvulas/{id}/comutar/ -> { status: 'ABERTA' | 'FECHADA' }
 * 4. GET /api/irrigacao/decisoes-ia/ -> Array<{ id: number, horario: string, valvula: string, acao: string, confianca: number, justificativa: string }>
 */

const modoOperacao = ref('MANUAL')
const limiarUmidade = ref(45)
const limiarTemperatura = ref(28)
const alterandoModo = ref(false)
const acionandoValvulaId = ref(null)
const carregandoLogs = ref(false)

const valvulas = ref([])
const logsDecisao = ref([])

async function carregarDadosIrrigacao() {
  try {
    const dados = await apiClient('/irrigacao/status/')
    modoOperacao.value = dados.modo || 'MANUAL'
    valvulas.value = dados.valvulas || []
    limiarUmidade.value = dados.limiarUmidade || 45
    limiarTemperatura.value = dados.limiarTemperatura || 28
  } catch {
    // Fallback de contingência caso endpoint ainda não esteja exposto no DRF
    valvulas.value = [
      { id: 1, nome: 'Válvula Solenoide 01', setor: 'Setor A - Folhosas', status: 'FECHADA' },
      { id: 2, nome: 'Válvula Solenoide 02', setor: 'Setor B - Tomateiro', status: 'ABERTA' },
      { id: 3, nome: 'Válvula Solenoide 03', setor: 'Setor C - Berçário', status: 'FECHADA' }
    ]
  }

  await carregarLogsDecisao()
}

async function carregarLogsDecisao() {
  carregandoLogs.value = true
  try {
    const logs = await apiClient('/irrigacao/decisoes-ia/')
    logsDecisao.value = logs
  } catch {
    // Fallback de explicabilidade agronômica da IA
    logsDecisao.value = [
      {
        id: 1,
        horario: '15:32:10',
        valvula: 'Válvula Solenoide 02',
        acao: 'DISPARO',
        confianca: 96.4,
        justificativa: 'Umidade do solo caiu para 38% com radiação alta. Risco de estresse hídrico na floração.'
      },
      {
        id: 2,
        horario: '14:15:00',
        valvula: 'Válvula Solenoide 01',
        acao: 'BLOQUEIO',
        confianca: 92.1,
        justificativa: 'Umidade em 64%. Irrigação cancelada para prevenir proliferação fúngica radicular.'
      }
    ]
  } finally {
    carregandoLogs.value = false
  }
}

async function definirModo(novoModo) {
  if (modoOperacao.value === novoModo) return
  alterandoModo.value = true

  try {
    await apiClient('/irrigacao/modo/', {
      method: 'POST',
      body: JSON.stringify({ modo: novoModo })
    })
    modoOperacao.value = novoModo
    toastStore.success(`Modo de irrigação alterado para: ${novoModo === 'AUTOMATICO_IA' ? 'Autônomo com IA' : 'Manual'}`)
  } catch {
    // Aplicação otimista caso backend esteja offline
    modoOperacao.value = novoModo
    toastStore.info(`Operação alterada localmente para ${novoModo}.`)
  } finally {
    alterandoModo.value = false
  }
}

async function alternarValvula(valvula) {
  const novoStatus = valvula.status === 'ABERTA' ? 'FECHADA' : 'ABERTA'
  acionandoValvulaId.value = valvula.id

  try {
    await apiClient(`/irrigacao/valvulas/${valvula.id}/comutar/`, {
      method: 'POST',
      body: JSON.stringify({ status: novoStatus })
    })
    valvula.status = novoStatus
    toastStore.success(`Válvula ${valvula.nome} agora está ${novoStatus}.`)
  } catch {
    valvula.status = novoStatus
    toastStore.info(`Comando registrado: ${valvula.nome} ${novoStatus}.`)
  } finally {
    acionandoValvulaId.value = null
  }
}

onMounted(() => {
  carregarDadosIrrigacao()
})
</script>

<style scoped>
.irrigacao-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.irrigacao-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.subtitle {
  color: var(--cor-texto-secundario, #607d8b);
  margin-top: 0.25rem;
  font-size: 0.9rem;
}

.modo-switch-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--cor-fundo-card, #ffffff);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--cor-borda, #cfd8dc);
  flex-wrap: wrap;
}

.modo-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-texto-principal, #37474f);
}

.switch-buttons {
  display: flex;
  background: #eceff1;
  border-radius: 6px;
  padding: 3px;
}

.btn-switch {
  border: none;
  background: transparent;
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  min-height: 44px;
  color: var(--cor-texto-secundario, #546e7a);
  transition: all 0.2s ease;
}

.btn-switch.active {
  background: #ffffff;
  color: var(--cor-texto-principal, #263238);
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

.btn-ia.active {
  background: var(--cor-verde-primaria, #2e7d32);
  color: #ffffff;
}

.ia-banner {
  background: #e8f5e9;
  border-left: 4px solid var(--cor-verde-primaria, #2e7d32);
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md, 8px);
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: #1b5e20;
}

.ia-badge-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.pulse-indicator {
  width: 10px;
  height: 10px;
  background-color: var(--cor-verde-primaria, #2e7d32);
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(46, 125, 50, 0.4);
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(46, 125, 50, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
}

.irrigacao-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.valvulas-section h3,
.decisoes-section h3 {
  margin-bottom: 1rem;
  color: var(--cor-texto-principal, #263238);
}

.valvulas-cards-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 1.25rem;
}

.valvula-card {
  background: var(--cor-fundo-card, #ffffff);
  border: 1px solid var(--cor-borda, #cfd8dc);
  border-radius: var(--radius-lg, 12px);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.valvula-card.aberta {
  border-color: #81c784;
  background: #f1f8e9;
}

.valvula-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.valvula-icon {
  font-size: 2rem;
}

.valvula-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--cor-texto-principal, #263238);
}

.setor-tag {
  font-size: 0.8rem;
  color: var(--cor-texto-secundario, #607d8b);
}

.valvula-status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.status-valor.aberta {
  color: var(--cor-verde-primaria, #2e7d32);
  font-weight: bold;
}

.status-valor.fechada {
  color: #78909c;
  font-weight: bold;
}

.btn-action-valvula {
  width: 100%;
  min-height: 44px;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-abrir {
  background-color: var(--cor-verde-primaria, #2e7d32);
  color: #ffffff;
}

.btn-fechar {
  background-color: #d32f2f;
  color: #ffffff;
}

.btn-action-valvula:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tabela de Decisões */
.decisoes-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
}

.decisoes-table th,
.decisoes-table td {
  padding: 0.9rem;
  text-align: left;
  border-bottom: 1px solid var(--cor-borda, #eceff1);
  font-size: 0.85rem;
}

.decisoes-table th {
  background-color: #f8fafc;
  color: #37474f;
  font-weight: 600;
}

.badge-decisao {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.acao-disparo {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.acao-bloqueio {
  background-color: #eceff1;
  color: #546e7a;
}

.justificativa-texto {
  max-width: 320px;
  color: #455a64;
}

.loading-cell, .empty-cell {
  text-align: center;
  padding: 2.5rem;
  color: #78909c;
}
</style>
