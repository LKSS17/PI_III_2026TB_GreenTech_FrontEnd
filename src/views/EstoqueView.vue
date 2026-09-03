<template>
  <Sidebar />
  <main class="main-content">

    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 40px; padding-top: 10px;">
      <DashHeader
        title="Estoque Consolidado"
        subtitle="Visão geral de inventário por cultura e histórico detalhado de transações."
      />
      <WeatherWidget />
    </div>

    <section class="registration-container-estoque">
      <div class="action-bar-estoque">
        <div class="search-box-estoque">
          <span class="material-symbols-outlined search-icon">search</span>
          <input type="text" class="search-input" v-model="busca" placeholder="Buscar cultura no estoque..." />
        </div>
        <button class="btn-generate" @click="abrirFormulario">
          <span class="material-symbols-outlined">swap_horiz</span> Lançar Movimentação
        </button>
      </div>

      <div class="inventory-split-view">
        <div class="seed-list-container">
          <div v-if="estoqueConsolidado.length === 0" class="empty-state">O estoque de culturas está zerado.</div>
          <div
            v-else
            v-for="item in estoqueConsolidado"
            :key="item.cultura_id"
            class="mini-card"
            :class="{ active: culturaSelecionada?.cultura_id === item.cultura_id }"
            @click="selecionarCultura(item)"
            style="cursor: pointer;"
          >
            <div class="mini-card-header">
              <h4>{{ item.nome_cultura }}</h4>
              <span class="badge badge-good">Inventário</span>
            </div>

            <div class="mini-card-cultura" style="margin-top: 5px;">
              Lotes em Desenvolvimento: <strong>{{ item.quantidade_lotes }}</strong>
            </div>

            <div class="mini-card-qty" style="color: #673ab7; font-size: 1rem; margin-top: 8px; font-weight: 600;">
              <span class="material-symbols-outlined" style="font-size: 1.1rem;">monitoring</span>
              Taxa de Produção: {{ item.taxa_producao ? parseFloat(item.taxa_producao).toFixed(1) : '0.0' }}%
            </div>

            <div class="mini-card-qty" style="color: #673ab7; font-size: 1rem; margin-top: 8px; font-weight: 600;">
              <span class="material-symbols-outlined" style="font-size: 1.1rem;">shopping_basket</span>
              Total Colhido: {{ parseFloat(item.total_colhido) }} {{ item.unidade }}
            </div>
          </div>
        </div>

        <div class="seed-detail-panel" style="overflow-y: auto; max-height: 70vh;">

          <form v-if="modoCadastro" @submit.prevent="salvarMovimentacao" class="form-grid-layout">
            <div class="detail-header" style="grid-column: 1 / -1;">
              <h2><span class="material-symbols-outlined">add_to_photos</span> Nova Movimentação</h2>
              <p style="color: #666; font-weight: normal; font-size: 0.9rem;">Esta ação alterará o saldo do lote correspondente.</p>
            </div>

            <div class="form-group full-width">
              <label>Lote Alvo</label>
              <select v-model="form.lote_id" required>
                <option value="" disabled>Selecione o lote...</option>
                <option v-for="l in lotes" :key="l.id" :value="l.id">Lote #{{ l.id }} (Mesa {{ l.mesa_id }} - Saldo: {{ l.quantidade }})</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tipo de Movimentação</label>
              <select v-model="form.tipo_movimentacao" required>
                <option value="Entrada">Entrada (Abastecimento)</option>
                <option value="Saída">Saída (Consumo/Uso)</option>
                <option value="Perda">Perda / Scrap</option>
                <option value="Ajuste">Ajuste de Inventário</option>
              </select>
            </div>

            <div class="form-group">
              <label>Quantidade</label>
              <input type="number" step="0.01" v-model="form.quantidade" min="0.01" required>
            </div>

            <div class="form-group full-width">
              <label>Motivo da Movimentação</label>
              <input type="text" v-model="form.motivo" placeholder="Ex: Quebra de mudas, correção manual..." required>
            </div>

            <div class="form-actions-right" style="grid-column: 1 / -1;">
              <button type="button" class="btn-outline" @click="modoCadastro = false">Fechar</button>
              <button type="submit" class="btn-save">Registrar Lançamento</button>
            </div>
          </form>

          <div v-else-if="culturaSelecionada">
            <div class="detail-header" style="margin-bottom: 20px;">
              <h2>Histórico de Transações: {{ culturaSelecionada.nome_cultura }}</h2>
              <p style="color: #666; font-size: 0.9rem;">Todas as movimentações de lotes ativos e encerrados desta espécie.</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
              <div style="background: rgba(58, 90, 64, 0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(58, 90, 64, 0.1);">
                <span style="font-size: 0.8rem; color: #666; font-weight: 600; display: block; margin-bottom: 5px;">SALDO ATUAL EM ESTUFA</span>
                <span style="font-size: 1.4rem; font-weight: bold; color: var(--primary-dark);">{{ parseFloat(culturaSelecionada.saldo_total) }} {{ culturaSelecionada.unidade }}</span>
              </div>
              <div style="background: rgba(103, 58, 183, 0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(103, 58, 183, 0.1);">
                <span style="font-size: 0.8rem; color: #666; font-weight: 600; display: block; margin-bottom: 5px;">TAXA DE PRODUÇÃO</span>
                <span style="font-size: 1.4rem; font-weight: bold; color: #673ab7;">{{ culturaSelecionada.taxa_producao ? parseFloat(culturaSelecionada.taxa_producao).toFixed(1) : '0.0' }}%</span>
              </div>
            </div>

            <h3 style="color: var(--primary-green); margin-bottom: 10px; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 5px;">history</span> Extrato de Movimentações
            </h3>

            <div class="extrato-filtros">
              <div class="filtro-item">
                <label>Tipo</label>
                <select v-model="filtros.tipo">
                  <option value="">Todos</option>
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAÍDA">Saída</option>
                  <option value="PERDA">Perda</option>
                  <option value="AJUSTE">Ajuste</option>
                </select>
              </div>

              <div class="filtro-item">
                <label>Lote</label>
                <select v-model="filtros.lote">
                  <option value="">Todos os Lotes</option>
                  <option v-for="loteId in lotesComMovimentacao" :key="loteId" :value="loteId">
                    Lote #{{ loteId }}
                  </option>
                </select>
              </div>

              <div class="filtro-item">
                <label>Data Inicial</label>
                <input type="date" v-model="filtros.dataInicio">
              </div>

              <div class="filtro-item">
                <label>Data Final</label>
                <input type="date" v-model="filtros.dataFim">
              </div>

              <button class="btn-clear-filters" @click="limparFiltros" title="Limpar Filtros">
                <span class="material-symbols-outlined">filter_alt_off</span>
              </button>
            </div>

            <div v-if="movimentacoesFiltradas.length === 0" style="color: #888; font-style: italic; padding: 10px; text-align: center; background: #f9f9f9; border-radius: 8px;">
              Nenhum registro de movimentação encontrado para estes filtros.
            </div>

            <div v-else style="display: flex; flex-direction: column; gap: 12px;">
              <div
                v-for="m in movimentacoesFiltradas"
                :key="m.id"
                style="background: #f9f9f9; padding: 14px; border-radius: 10px; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;"
              >
                <div>
                  <span class="badge" :class="m.tipo_movimentacao.toUpperCase() === 'ENTRADA' ? 'badge-good' : 'badge-out'" style="margin-right: 10px;">
                    {{ m.tipo_movimentacao.toUpperCase() }}
                  </span>
                  <span style="font-weight: 700; color: #444;">Lote #{{ m.lote_id }}</span>
                  <p style="font-size: 0.85rem; color: #666; margin-top: 4px;">{{ m.motivo }}</p>
                  <div style="font-size: 0.75rem; color: #999; margin-top: 2px;">{{ new Date(m.data_movimentacao).toLocaleString('pt-BR') }}</div>
                </div>

                <div style="display: flex; align-items: center; gap: 15px;">
                  <div style="font-weight: bold; font-size: 1.1rem;" :style="{ color: m.tipo_movimentacao.toUpperCase() === 'ENTRADA' ? '#2e7d32' : '#c62828' }">
                    {{ m.tipo_movimentacao.toUpperCase() === 'ENTRADA' ? '+' : '-' }}{{ parseFloat(m.quantidade) }}
                  </div>

                  <button
                    v-if="isGerente || isAdmin"
                    @click.stop="excluirMovimentacao(m.id)"
                    style="background: none; border: none; color: #c62828; cursor: pointer; padding: 6px; border-radius: 6px; transition: background 0.2s; display: flex; align-items: center; justify-content: center;"
                    onmouseover="this.style.background='#ffcdd2'"
                    onmouseout="this.style.background='transparent'"
                    title="Excluir este registro do Histórico"
                  >
                    <span class="material-symbols-outlined" style="font-size: 1.3rem;">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="detalhe-placeholder" style="text-align: center; color: #aaa; margin-top: 120px;">
            <span class="material-symbols-outlined" style="font-size: 3.5rem;">inventory</span>
            <p>Selecione uma cultura ao lado para auditar seu extrato completo de transações.</p>
            <p style="font-size: 0.85rem; margin-top: 5px;">Ou clique em "Lançar Movimentação" para fazer um ajuste manual.</p>
          </div>

        </div>
      </div>
    </section>
    <Footer/>
  </main>
</template>

<script setup>
import { verificarPermissao } from '@/assets/JS/verificarPermissao.js'
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import DashHeader from "@/components/DashHeader.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";

const isGerente = ref(false);
const isAdmin = ref(false);

const lotes = ref([]);
const culturas = ref([]);
const colheitas = ref([]);
const movimentacoesGerais = ref([]);

const culturaSelecionada = ref(null);
const modoCadastro = ref(false);
const busca = ref('');

const form = ref({ lote_id: '', tipo_movimentacao: 'Entrada', quantidade: 0.0, motivo: '' });

const filtros = ref({
  tipo: '',
  lote: '',
  dataInicio: '',
  dataFim: ''
});

const estoqueConsolidado = computed(() => {
  const consolidados = {};

  culturas.value.forEach(c => {
    consolidados[c.id] = {
      nome_cultura: c.nome_cultura,
      cultura_id: c.id,
      saldo_total: 0,
      quantidade_lotes: 0,
      taxa_producao: c.taxa_producao || 0,
      total_colhido: c.total_colhido || 0,
      unidade: 'Unidades'
    };
  });

  lotes.value.forEach(lote => {
    if (lote.status !== 'CO' && lote.status !== 'PE' && consolidados[lote.cultura_id]) {
      consolidados[lote.cultura_id].saldo_total += parseFloat(lote.quantidade);
      consolidados[lote.cultura_id].quantidade_lotes += 1;
      consolidados[lote.cultura_id].unidade = lote.unidade;
    }
  });

  return Object.values(consolidados).filter(item =>
    item.nome_cultura.toLowerCase().includes(busca.value.toLowerCase()) &&
    (item.saldo_total > 0 || item.total_colhido > 0 || item.taxa_producao > 0)
  );
});

// Movimentações brutas da cultura selecionada
const movimentacoesDaCultura = computed(() => {
  if (!culturaSelecionada.value) return [];
  return movimentacoesGerais.value.filter(m => {
    const lote = lotes.value.find(l => l.id === m.lote_id);
    return lote && lote.cultura_id === culturaSelecionada.value.cultura_id;
  }).reverse();
});

// Extrai inteligentemente apenas os IDs de lotes que realmente possuem movimentações
const lotesComMovimentacao = computed(() => {
  const ids = new Set(movimentacoesDaCultura.value.map(m => m.lote_id));
  return Array.from(ids).sort((a, b) => a - b);
});

const movimentacoesFiltradas = computed(() => {
  let resultado = movimentacoesDaCultura.value;

  if (filtros.value.tipo) {
    resultado = resultado.filter(m =>
      m.tipo_movimentacao.toUpperCase().replace('Í', 'I') === filtros.value.tipo.replace('Í', 'I')
    );
  }

  if (filtros.value.lote) {
    resultado = resultado.filter(m => String(m.lote_id) === String(filtros.value.lote));
  }

  if (filtros.value.dataInicio) {
    const dataInicio = new Date(filtros.value.dataInicio).getTime();
    resultado = resultado.filter(m => new Date(m.data_movimentacao).getTime() >= dataInicio);
  }

  if (filtros.value.dataFim) {
    const dataFim = new Date(filtros.value.dataFim);
    dataFim.setHours(23, 59, 59, 999); // Vai até o último segundo do dia final
    resultado = resultado.filter(m => new Date(m.data_movimentacao).getTime() <= dataFim.getTime());
  }

  return resultado;
});

const limparFiltros = () => {
  filtros.value = { tipo: '', lote: '', dataInicio: '', dataFim: '' };
};

const verificarAcessos = async () => {
  const permissoes = await verificarPermissao();
  isGerente.value = permissoes.isGerente;
  isAdmin.value = permissoes.isAdmin;
};

const carregarDadosBase = async () => {
  const headers = { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` };
  try {
    const [resLotes, resCulturas, resColheitas, resEstoque] = await Promise.all([
      fetch('/api/lotes/', { headers }),
      fetch('/api/cultura/', { headers }),
      fetch('/api/colheita/', { headers }),
      fetch('/api/estoque/', { headers })
    ]);

    if (resLotes.ok) lotes.value = await resLotes.json();
    if (resCulturas.ok) culturas.value = await resCulturas.json();
    if (resColheitas.ok) colheitas.value = await resColheitas.json();
    if (resEstoque.ok) movimentacoesGerais.value = await resEstoque.json();

    if (culturaSelecionada.value) {
      const atualizada = estoqueConsolidado.value.find(item => item.cultura_id === culturaSelecionada.value.cultura_id);
      if (atualizada) culturaSelecionada.value = atualizada;
    }
  } catch (err) {
    console.error("Erro ao sincronizar dados:", err);
  }
};

const selecionarCultura = (item) => {
  culturaSelecionada.value = item;
  modoCadastro.value = false;
  limparFiltros(); // Reseta os filtros ao trocar de cultura!
};

const abrirFormulario = () => {
  modoCadastro.value = true;
  culturaSelecionada.value = null;
};

const salvarMovimentacao = async () => {
  const token = localStorage.getItem('access_token');
  const loteAlvo = lotes.value.find(l => l.id === form.value.lote_id);
  const payload = { ...form.value, unidade: loteAlvo ? loteAlvo.unidade : 'Unidades' };

  try {
    const res = await fetch('/api/estoque/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Movimentação gravada!");
      form.value = { lote_id: '', tipo_movimentacao: 'Entrada', quantidade: 0.0, motivo: '' };
      modoCadastro.value = false;
      await carregarDadosBase();
    } else {
      alert("Erro ao registrar movimentação. Verifique se o lote alvo possui saldo suficiente.");
    }
  } catch (err) {
    console.error(err);
  }
};

const excluirMovimentacao = async (id) => {
  if (!confirm(`TEM CERTEZA? Deseja excluir permanentemente este registro do histórico?`)) return;
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch(`/api/estoque/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      alert("Registro excluído com sucesso!");
      await carregarDadosBase();
    } else {
      const erro = await res.json();
      alert(erro.error || "Acesso negado ou erro ao excluir.");
    }
  } catch (err) {
    console.error("Erro ao excluir movimentação:", err);
  }
};

onMounted(() => {
  carregarDadosBase();
  verificarAcessos();
});
</script>

<style scoped>
/* Estilos para a Barra de Filtros do Extrato */
.extrato-filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 15px;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 120px;
}

.filtro-item label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
}

.filtro-item select,
.filtro-item input {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  color: #333;
  outline: none;
  transition: border-color 0.2s;
}

.filtro-item select:focus,
.filtro-item input:focus {
  border-color: var(--primary-green, #4caf50);
}

.btn-clear-filters {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  height: 36px;
}

.btn-clear-filters:hover {
  background: #ffcdd2;
  transform: translateY(-1px);
}
</style>
