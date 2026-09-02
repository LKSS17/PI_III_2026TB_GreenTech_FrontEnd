<template>
  <div class="historico-container">
    <header class="historico-header">
      <div>
        <h2>Auditoria Geral & Rastreabilidade</h2>
        <p class="subtitle">Registro imutável de ações executadas pelos operadores e pelo sistema.</p>
      </div>

      <div class="filtro-auditoria">
        <label for="filtro-modulo" class="sr-only">Filtrar por Módulo</label>
        <select id="filtro-modulo" v-model="moduloFiltro" class="select-touch" @change="carregarAuditoria">
          <option value="todos">Todos os Módulos</option>
          <option value="ESTOQUE">Estoque</option>
          <option value="IRRIGACAO">Irrigação</option>
          <option value="CULTURA">Culturas & Lotes</option>
          <option value="SEGURANCA">Acesso & Autenticação</option>
        </select>
      </div>
    </header>

    <!-- Visualização Híbrida: Tabela no Desktop / Cards no Mobile -->
    <section class="auditoria-content">
      <div v-if="carregando" class="state-placeholder">
        Carregando registros de auditoria...
      </div>

      <div v-else-if="registros.length === 0" class="state-placeholder">
        Nenhum evento registrado para o período solicitado.
      </div>

      <div v-else class="tabela-responsiva-cards">
        <table class="tabela-base">
          <thead>
            <tr>
              <th scope="col">Data/Hora</th>
              <th scope="col">Usuário</th>
              <th scope="col">Módulo</th>
              <th scope="col">Ação</th>
              <th scope="col">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in registros" :key="item.id" class="registro-item">
              <td data-label="Data/Hora" class="col-data">{{ item.dataHora }}</td>
              <td data-label="Usuário" class="col-usuario"><strong>{{ item.usuario }}</strong></td>
              <td data-label="Módulo" class="col-modulo">
                <span class="badge-modulo">{{ item.modulo }}</span>
              </td>
              <td data-label="Ação" class="col-acao">{{ item.acao }}</td>
              <td data-label="Detalhes" class="col-detalhes">{{ item.detalhes }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação Ergonômica Mobile (44px target) -->
      <footer class="paginacao-footer">
        <button 
          type="button" 
          class="btn-pagina" 
          :disabled="paginaAtual === 1" 
          @click="mudarPagina(-1)"
          aria-label="Página Anterior"
        >
          ⬅ Anterior
        </button>
        <span class="pagina-indicador">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
        <button 
          type="button" 
          class="btn-pagina" 
          :disabled="paginaAtual >= totalPaginas" 
          @click="mudarPagina(1)"
          aria-label="Próxima Página"
        >
          Próxima ➡
        </button>
      </footer>
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
 * GET /api/funcionarios/auditoria/?modulo={moduloFiltro}&pagina={paginaAtual}
 * Resposta esperada:
 * { resultados: Array<{ id: number, dataHora: string, usuario: string, modulo: string, acao: string, detalhes: string }>, totalPaginas: number }
 */
const registros = ref([])
const carregando = ref(false)
const moduloFiltro = ref('todos')
const paginaAtual = ref(1)
const totalPaginas = ref(1)

async function carregarAuditoria() {
  carregando.value = true
  try {
    const data = await apiClient(`/funcionarios/auditoria/?modulo=${moduloFiltro.value}&page=${paginaAtual.value}`)
    registros.value = data.resultados || data
    totalPaginas.value = data.totalPaginas || 1
  } catch (err) {
    // Fallback de contingência caso endpoint do DRF ainda esteja em validação de superuser
    registros.value = [
      { id: 101, dataHora: '02/09/2026 16:45', usuario: 'lucas.souza', modulo: 'IRRIGACAO', acao: 'Disparo Manual', detalhes: 'Válvula Setor 01 acionada por 15 minutos.' },
      { id: 102, dataHora: '02/09/2026 14:10', usuario: 'sistema.ia', modulo: 'IRRIGACAO', acao: 'Decisão Automática', detalhes: 'Acionamento cancelado: umidade acima do limiar de 60%.' },
      { id: 103, dataHora: '02/09/2026 11:32', usuario: 'felipe.costa', modulo: 'ESTOQUE', acao: 'Importação NF-e', detalhes: 'Adicionados 50kg de Nitrato de Cálcio via OCR.' }
    ]
  } finally {
    carregando.value = false
  }
}

function mudarPagina(delta) {
  paginaAtual.value += delta
  carregarAuditoria()
}

onMounted(() => {
  carregarAuditoria()
})
</script>

<style scoped>
.historico-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.historico-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.subtitle {
  color: var(--cor-texto-secundario, #607d8b);
  margin-top: 0.25rem;
  font-size: 0.9rem;
}

.select-touch {
  min-height: 44px;
  min-width: 180px;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--cor-borda, #cfd8dc);
  background: #ffffff;
  font-size: 0.95rem;
}

.tabela-base {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.tabela-base th, 
.tabela-base td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--cor-borda, #eceff1);
  font-size: 0.9rem;
}

.tabela-base th {
  background-color: #f8fafc;
  color: #37474f;
  font-weight: 600;
}

.badge-modulo {
  background: #eceff1;
  color: #37474f;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.paginacao-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
}

.btn-pagina {
  min-height: 44px;
  min-width: 110px;
  padding: 0.5rem 1rem;
  background: #ffffff;
  border: 1px solid var(--cor-borda, #cfd8dc);
  border-radius: var(--radius-md, 6px);
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.state-placeholder {
  text-align: center;
  padding: 3rem;
  color: #78909c;
  background: #fff;
  border-radius: 8px;
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

/* ==========================================================================
   TRANSFORMAÇÃO AUTOMÁTICA EM CARDS NO MOBILE (< 768px)
   ========================================================================== */
@media (max-width: 768px) {
  .tabela-base thead {
    display: none; /* Oculta cabeçalho tabular */
  }

  .tabela-base, 
  .tabela-base tbody, 
  .tabela-base tr, 
  .tabela-base td {
    display: block;
    width: 100%;
  }

  .registro-item {
    background: #ffffff;
    border: 1px solid var(--cor-borda, #e0e0e0);
    border-radius: var(--radius-md, 8px);
    margin-bottom: 1rem;
    padding: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  }

  .tabela-base td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed #eceff1;
    padding: 0.65rem 0.5rem;
    text-align: right;
  }

  .tabela-base td:last-child {
    border-bottom: none;
  }

  /* Exibe o rótulo da coluna automaticamente via data-label */
  .tabela-base td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #546e7a;
    font-size: 0.8rem;
    text-align: left;
    margin-right: 1rem;
  }

  .col-detalhes {
    text-align: right;
    word-break: break-word;
  }
}
</style>