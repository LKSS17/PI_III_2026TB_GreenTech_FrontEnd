<template>
  <div class="previsao-estoque-card">
    <div class="card-header">
      <div class="title-area">
        <h3>Previsão de Término de Insumos (IA Prophet)</h3>
        <span class="badge-ia" :class="{ 'badge-mock': isMock }">
          {{ isMock ? 'Simulação Local' : 'Modelo Prophet Ativo' }}
        </span>
      </div>
      <button 
        type="button" 
        class="btn-refresh" 
        @click="buscarPrevisao" 
        :disabled="carregando"
        aria-label="Atualizar projeções"
      >
        🔄
      </button>
    </div>

    <div v-if="carregando" class="loading-state">
      <div class="spinner"></div>
      <p>Executando projeções de consumo...</p>
    </div>

    <div v-else class="previsao-grid">
      <div v-for="item in insumosPrevistos" :key="item.id" class="insumo-card">
        <div class="insumo-info">
          <h4>{{ item.nome }}</h4>
          <span class="categoria">{{ item.categoria }}</span>
        </div>

        <div class="insumo-metricas">
          <div>
            <span class="label">Qtd Atual:</span>
            <strong>{{ item.quantidadeAtual }} {{ item.unidade }}</strong>
          </div>
          <div>
            <span class="label">Esgotamento Estimado:</span>
            <strong :class="getUrgenciaClass(item.diasRestantes)">
              {{ item.dataEstimada }} ({{ item.diasRestantes }} dias)
            </strong>
          </div>
        </div>

        <div class="progresso-container">
          <div 
            class="progresso-bar" 
            :style="{ width: `${item.percentualRestante}%` }"
            :class="getUrgenciaClass(item.diasRestantes)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/services/api'

const insumosPrevistos = ref([])
const carregando = ref(false)
const isMock = ref(false)

async function buscarPrevisao() {
  carregando.value = true
  try {
    // Endpoint Plug-and-Play: se o back-end já tiver o Prophet, recebe os dados reais
    const data = await apiClient('/estoque/previsao-prophet/')
    insumosPrevistos.value = data
    isMock.value = false
  } catch (err) {
    // Fallback gracioso: gera a projeção sem quebrar a interface
    isMock.value = true
    insumosPrevistos.value = [
      {
        id: 1,
        nome: 'Fertilizante NPK 10-10-10',
        categoria: 'Nutrição',
        quantidadeAtual: 140,
        unidade: 'kg',
        diasRestantes: 12,
        dataEstimada: '14/09/2026',
        percentualRestante: 25
      },
      {
        id: 2,
        nome: 'Substrato Orgânico Turbinado',
        categoria: 'Solo',
        quantidadeAtual: 620,
        unidade: 'sacos',
        diasRestantes: 45,
        dataEstimada: '17/10/2026',
        percentualRestante: 70
      },
      {
        id: 3,
        nome: 'Biofungicida Trichoderma',
        categoria: 'Defensivo',
        quantidadeAtual: 8,
        unidade: 'L',
        diasRestantes: 4,
        dataEstimada: '06/09/2026',
        percentualRestante: 10
      }
    ]
  } finally {
    carregando.value = false
  }
}

function getUrgenciaClass(dias) {
  if (dias <= 5) return 'status-critico'
  if (dias <= 15) return 'status-alerta'
  return 'status-normal'
}

onMounted(() => {
  buscarPrevisao()
})
</script>

<style scoped>
.previsao-estoque-card {
  background: var(--cor-fundo-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  padding: 1.5rem;
  box-shadow: var(--sombra-card, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  margin-top: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge-ia {
  background: var(--cor-verde-primaria, #2e7d32);
  color: #fff;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-weight: bold;
}

.badge-mock {
  background: var(--cor-alerta-amarelo, #f57c00);
}

.btn-refresh {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
}

.previsao-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 1.25rem;
}

.insumo-card {
  border: 1px solid var(--cor-borda, #e0e0e0);
  border-radius: var(--radius-md, 8px);
  padding: 1rem;
  background: var(--cor-fundo-item, #fafafa);
}

.insumo-info h4 {
  margin: 0;
  color: var(--cor-texto-principal, #263238);
}

.categoria {
  font-size: 0.8rem;
  color: var(--cor-texto-secundario, #607d8b);
}

.insumo-metricas {
  margin: 0.75rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.progresso-container {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progresso-bar {
  height: 100%;
}

.status-critico {
  color: var(--cor-alerta-erro, #d32f2f) !important;
  background-color: var(--cor-alerta-erro, #d32f2f);
}

.status-alerta {
  color: var(--cor-alerta-amarelo, #f57c00) !important;
  background-color: var(--cor-alerta-amarelo, #f57c00);
}

.status-normal {
  color: var(--cor-verde-primaria, #2e7d32) !important;
  background-color: var(--cor-verde-primaria, #2e7d32);
}

.loading-state {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #ccc;
  border-top-color: var(--cor-verde-primaria, #2e7d32);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>