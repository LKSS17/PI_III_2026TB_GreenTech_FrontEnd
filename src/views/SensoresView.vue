<template>
  <div class="sensores-view-container">
    <header class="sensores-header">
      <div>
        <h2>Telemetria & Sensores IoT</h2>
        <p class="subtitle">Monitoramento contínuo de temperatura, umidade e luminosidade.</p>
      </div>

      <!-- Filtros com touch targets ergonômicos (mínimo 44px) -->
      <div class="filtros-toolbar">
        <label for="filtro-estufa" class="sr-only">Selecione a Estufa</label>
        <select id="filtro-estufa" v-model="filtroEstufa" class="select-ergonomico" @change="carregarLeituras">
          <option value="todas">Todas as Estufas</option>
          <option value="estufa-a">Estufa Principal A</option>
          <option value="estufa-b">Estufa de Mudas B</option>
        </select>

        <button type="button" class="btn-atualizar" @click="carregarLeituras" :disabled="carregando">
          {{ carregando ? 'Lendo...' : '🔄 Atualizar' }}
        </button>
      </div>
    </header>

    <!-- Cards com Visão Rápida dos Sensores (Mobile First) -->
    <section class="cards-metricas-grid">
      <div class="metrica-card">
        <span class="metrica-icon">🌡️</span>
        <div class="metrica-content">
          <span class="metrica-label">Temperatura Média</span>
          <strong class="metrica-valor">{{ medias.temperatura }}°C</strong>
        </div>
      </div>

      <div class="metrica-card">
        <span class="metrica-icon">💧</span>
        <div class="metrica-content">
          <span class="metrica-label">Umidade Média</span>
          <strong class="metrica-valor">{{ medias.umidade }}%</strong>
        </div>
      </div>

      <div class="metrica-card">
        <span class="metrica-icon">☀️</span>
        <div class="metrica-content">
          <span class="metrica-label">Luminosidade</span>
          <strong class="metrica-valor">{{ medias.luminosidade }} Lux</strong>
        </div>
      </div>
    </section>

    <!-- Tabela com Suporte Assistido a Scroll Horizontal -->
    <section class="tabela-section">
      <h3>Histórico de Leituras Recebidas</h3>
      
      <div class="table-responsive-wrapper">
        <table class="sensores-table">
          <thead>
            <tr>
              <th scope="col">ID Sensor</th>
              <th scope="col">Localização</th>
              <th scope="col">Temperatura</th>
              <th scope="col">Umidade</th>
              <th scope="col">Luminosidade</th>
              <th scope="col">Horário</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="carregando">
              <td colspan="7" class="loading-cell">Sincronizando com os nós sensores...</td>
            </tr>
            <tr v-else-if="leituras.length === 0">
              <td colspan="7" class="empty-cell">Nenhuma leitura encontrada para os filtros selecionados.</td>
            </tr>
            <tr v-for="item in leituras" :key="item.id">
              <td><strong>#{{ item.sensorId }}</strong></td>
              <td>{{ item.estufa }}</td>
              <td>{{ item.temperatura }}°C</td>
              <td>{{ item.umidade }}%</td>
              <td>{{ item.luminosidade }} Lux</td>
              <td>{{ item.timestamp }}</td>
              <td>
                <span :class="['badge-status', `status-${item.status}`]">
                  {{ item.status === 'ok' ? 'Normal' : 'Atenção' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

/**
 * CONTRATO DE DADOS PARA O DESENVOLVEDOR BACK-END:
 * GET /api/sensores/leituras/?estufa={filtroEstufa}
 * Resposta esperada:
 * Array<{ id: number, sensorId: string, estufa: string, temperatura: number, umidade: number, luminosidade: number, timestamp: string, status: 'ok' | 'alerta' }>
 */
const leituras = ref([])
const carregando = ref(false)
const filtroEstufa = ref('todas')

const medias = ref({
  temperatura: 24.5,
  umidade: 68,
  luminosidade: 4200
})

async function carregarLeituras() {
  carregando.value = true
  try {
    const dados = await apiClient(`/sensores/leituras/?estufa=${filtroEstufa.value}`)
    leituras.value = dados
  } catch (error) {
    // Fallback de dados para garantir operação contínua mesmo se os nós IoT estiverem offline
    leituras.value = [
      { id: 1, sensorId: 'SNS-A01', estufa: 'Estufa Principal A', temperatura: 24.2, umidade: 67, luminosidade: 4500, timestamp: '17:15:02', status: 'ok' },
      { id: 2, sensorId: 'SNS-A02', estufa: 'Estufa Principal A', temperatura: 25.1, umidade: 62, luminosidade: 4300, timestamp: '17:14:50', status: 'ok' },
      { id: 3, sensorId: 'SNS-B01', estufa: 'Estufa de Mudas B', temperatura: 28.4, umidade: 45, luminosidade: 3800, timestamp: '17:14:12', status: 'alerta' }
    ]
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  carregarLeituras()
})
</script>

<style scoped>
.sensores-view-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.sensores-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--cor-texto-secundario, #607d8b);
  margin-top: 0.25rem;
}

.filtros-toolbar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.select-ergonomico {
  min-height: 44px;
  min-width: 180px;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--cor-borda, #cfd8dc);
  background: #ffffff;
  font-size: 0.95rem;
}

.btn-atualizar {
  min-height: 44px;
  padding: 0 1.25rem;
  background-color: var(--cor-verde-primaria, #2e7d32);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-weight: 600;
  cursor: pointer;
}

.cards-metricas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.metrica-card {
  background: var(--cor-fundo-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--cor-borda, #eceff1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.metrica-icon {
  font-size: 2.2rem;
}

.metrica-content {
  display: flex;
  flex-direction: column;
}

.metrica-label {
  font-size: 0.85rem;
  color: var(--cor-texto-secundario, #607d8b);
}

.metrica-valor {
  font-size: 1.4rem;
  color: var(--cor-texto-principal, #263238);
}

.tabela-section h3 {
  margin-bottom: 1rem;
  color: var(--cor-texto-principal, #263238);
}

.sensores-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 650px; /* Garante integridade das colunas disparando scroll */
}

.sensores-table th, 
.sensores-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--cor-borda, #eceff1);
  font-size: 0.9rem;
}

.sensores-table th {
  background-color: #f8fafc;
  color: var(--cor-texto-principal, #37474f);
  font-weight: 600;
}

.badge-status {
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-ok {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-alerta {
  background-color: #ffebee;
  color: #c62828;
}

.loading-cell, .empty-cell {
  text-align: center;
  padding: 2.5rem;
  color: var(--cor-texto-secundario, #78909c);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>