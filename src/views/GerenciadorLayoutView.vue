<template>
  <div class="layout-container">
    <header class="page-header">
      <div class="header-titles">
        <h2>Gêmeo Virtual da Estufa</h2>
        <p class="subtitle">Mapeamento espacial dos canteiros, sensores e atuadores.</p>
      </div>

      <!-- Barra de Ferramentas Ergonômica Mobile/Desktop -->
      <div class="view-controls" role="toolbar" aria-label="Controles do Gêmeo Virtual">
        <!-- Alternador de Perspectiva 2D / 3D -->
        <div class="mode-switch">
          <button 
            type="button"
            :class="['btn-toggle', { active: modoVisualizacao === '3d' }]"
            @click="modoVisualizacao = '3d'"
            aria-label="Alternar para visão isométrica 3D"
          >
            🏢 3D Isométrico
          </button>
          <button 
            type="button"
            :class="['btn-toggle', { active: modoVisualizacao === '2d' }]"
            @click="modoVisualizacao = '2d'"
            aria-label="Alternar para visão em grade 2D"
          >
            📐 Grade 2D
          </button>
        </div>

        <!-- Controles de Zoom -->
        <div class="zoom-controls">
          <button 
            type="button" 
            class="btn-zoom" 
            @click="ajustarZoom(-0.1)" 
            title="Reduzir zoom"
            aria-label="Diminuir Zoom"
          >
            ➖
          </button>
          <span class="zoom-label" aria-live="polite">{{ Math.round(escalaZoom * 100) }}%</span>
          <button 
            type="button" 
            class="btn-zoom" 
            @click="ajustarZoom(0.1)" 
            title="Aumentar zoom"
            aria-label="Aumentar Zoom"
          >
            ➕
          </button>
          <button 
            type="button" 
            class="btn-zoom-reset" 
            @click="resetarZoom"
            aria-label="Restaurar Zoom Original"
          >
            Reset
          </button>
        </div>
      </div>
    </header>

    <!-- Canvas de Exibição Espacial -->
    <main class="viewport-canvas">
      <div 
        class="scene-transformer"
        :class="[`mode-${modoVisualizacao}`]"
        :style="transformStyles"
      >
        <div class="grid-estufa">
          <div 
            v-for="celula in gradeEstufa" 
            :key="celula.id"
            :class="['celula-grid', `tipo-${celula.tipo}`, { selecionado: celulaSelecionada?.id === celula.id }]"
            @click="selecionarCelula(celula)"
          >
            <div class="celula-content">
              <span class="celula-icon">{{ getIconeTipo(celula.tipo) }}</span>
              <span class="celula-coord">{{ celula.linha }}x{{ celula.coluna }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Drawer de Detalhes do Canteiro/Módulo Selecionado -->
    <aside v-if="celulaSelecionada" class="details-panel" aria-label="Detalhes da Posição Selecionada">
      <div class="panel-header">
        <h3>Posição [{{ celulaSelecionada.linha }}, {{ celulaSelecionada.coluna }}]</h3>
        <button 
          type="button" 
          class="btn-close-panel" 
          @click="celulaSelecionada = null"
          aria-label="Fechar painel de detalhes"
        >
          &times;
        </button>
      </div>
      <div class="panel-body">
        <p><strong>Tipo:</strong> {{ getDescricaoTipo(celulaSelecionada.tipo) }}</p>
        <p><strong>Status Operacional:</strong> <span class="status-badge ativo">Ativo</span></p>
        <p v-if="celulaSelecionada.cultura"><strong>Cultura Atual:</strong> {{ celulaSelecionada.cultura }}</p>
        <p v-if="celulaSelecionada.umidade"><strong>Umidade do Solo:</strong> {{ celulaSelecionada.umidade }}%</p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiClient } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

/**
 * CONTRATO DE DADOS PARA O DESENVOLVEDOR BACK-END:
 * GET /api/estufas/layout/
 * Resposta esperada:
 * Array<{ id: number, linha: number, coluna: number, tipo: 'canteiro' | 'corredor' | 'sensor' | 'valvula', cultura?: string, umidade?: number }>
 */
const gradeEstufa = ref([])
const celulaSelecionada = ref(null)
const modoVisualizacao = ref('3d') // '3d' ou '2d'
const escalaZoom = ref(1)

const transformStyles = computed(() => {
  return {
    transform: `scale(${escalaZoom.value})`,
    transformOrigin: 'center center'
  }
})

function ajustarZoom(delta) {
  const novoZoom = Math.min(Math.max(escalaZoom.value + delta, 0.5), 1.6)
  escalaZoom.value = parseFloat(novoZoom.toFixed(2))
}

function resetarZoom() {
  escalaZoom.value = window.innerWidth <= 480 ? 0.75 : 1
}

function selecionarCelula(celula) {
  celulaSelecionada.value = celula
}

function getIconeTipo(tipo) {
  const mapa = {
    canteiro: '🌱',
    sensor: '📟',
    valvula: '💧',
    corredor: '⬜'
  }
  return mapa[tipo] || '📦'
}

function getDescricaoTipo(tipo) {
  const mapa = {
    canteiro: 'Canteiro Produtivo',
    sensor: 'Estação de Telemetria',
    valvula: 'Válvula de Irrigação Automatizada',
    corredor: 'Área Livre de Circulação'
  }
  return mapa[tipo] || tipo
}

async function carregarLayout() {
  try {
    const dados = await apiClient('/estufas/layout/')
    gradeEstufa.value = dados
  } catch (error) {
    // Fallback de contingência (grid padrão 4x4) caso o endpoint do back ainda não tenha sido populado
    const gridMock = []
    for (let r = 1; r <= 4; r++) {
      for (let c = 1; c <= 4; c++) {
        let tipo = 'canteiro'
        if (r === 2 && c === 2) tipo = 'sensor'
        else if (r === 3 && c === 3) tipo = 'valvula'
        else if (c === 1) tipo = 'corredor'

        gridMock.push({
          id: (r - 1) * 4 + c,
          linha: r,
          coluna: c,
          tipo,
          cultura: tipo === 'canteiro' ? 'Alface Americana' : null,
          umidade: tipo === 'sensor' ? 64 : null
        })
      }
    }
    gradeEstufa.value = gridMock
  }
}

onMounted(() => {
  // Em celulares estreitos, inicia com zoom reduzido para evitar transbordo inicial
  if (window.innerWidth <= 480) {
    escalaZoom.value = 0.75
  }
  carregarLayout()
})
</script>

<style scoped>
.layout-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  position: relative;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  z-index: 10;
}

.header-titles h2 {
  margin: 0;
  color: var(--cor-texto-principal, #263238);
}

.subtitle {
  margin: 0.25rem 0 0 0;
  color: var(--cor-texto-secundario, #607d8b);
  font-size: 0.9rem;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.mode-switch {
  display: flex;
  background: #eceff1;
  border-radius: var(--radius-md, 8px);
  padding: 0.25rem;
}

.btn-toggle {
  border: none;
  background: transparent;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--cor-texto-principal, #455a64);
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  min-height: 44px;
}

.btn-toggle.active {
  background: var(--cor-verde-primaria, #2e7d32);
  color: #ffffff;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--cor-borda, #cfd8dc);
}

.btn-zoom, .btn-zoom-reset {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid var(--cor-borda, #cfd8dc);
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.zoom-label {
  min-width: 50px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: bold;
}

/* Área de renderização da estufa */
.viewport-canvas {
  flex: 1;
  width: 100%;
  background: #f0f4f8;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--cor-borda, #cfd8dc);
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  touch-action: pan-x pan-y;
}

.scene-transformer {
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: inline-block;
}

/* Modo 3D Isométrico */
.mode-3d .grid-estufa {
  transform: rotateX(60deg) rotateZ(-45deg);
  box-shadow: -15px 15px 25px rgba(0, 0, 0, 0.15);
}

/* Modo 2D Técnico */
.mode-2d .grid-estufa {
  transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.grid-estufa {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  grid-template-rows: repeat(4, 100px);
  gap: 12px;
  background: #cfd8dc;
  padding: 16px;
  border-radius: 8px;
  transition: transform 0.4s ease;
}

.celula-grid {
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: all 0.2s;
}

.celula-grid:hover {
  transform: translateY(-2px);
  border-color: var(--cor-verde-primaria, #2e7d32);
}

.celula-grid.selecionado {
  border-color: var(--cor-verde-primaria, #2e7d32);
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
}

.celula-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.celula-icon {
  font-size: 1.5rem;
}

.celula-coord {
  font-size: 0.75rem;
  color: #78909c;
}

/* Painel lateral de detalhes */
.details-panel {
  position: absolute;
  right: 1.5rem;
  top: 6rem;
  width: 300px;
  background: #ffffff;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--cor-borda, #cfd8dc);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 50;
}

.panel-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eceff1;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
}

.btn-close-panel {
  background: transparent;
  border: none;
  font-size: 1.4rem;
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
}

.panel-body {
  padding: 1rem;
  font-size: 0.9rem;
}

.status-badge.ativo {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .layout-container {
    padding: 0.75rem;
    height: auto;
    min-height: calc(100vh - 60px);
  }

  .details-panel {
    position: fixed;
    right: 0;
    bottom: 0;
    top: auto;
    width: 100%;
    border-radius: 12px 12px 0 0;
  }
}
</style>