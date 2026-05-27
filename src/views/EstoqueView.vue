<template>
  <Sidebar />
  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Estoque Consolidado</h1>
        <p>Visão geral de inventário por cultura e histórico detalhado de transações.</p>
      </div>
      <WeatherWidget />
    </header>

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

            <div class="mini-card-qty" style="color: var(--primary-dark); font-size: 1.1rem; margin-top: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
              <span class="material-symbols-outlined" style="font-size: 1.2rem;">psychiatry</span>
              Saldo Vivo: {{ parseFloat(item.saldo_total) }} {{ item.unidade }}
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
                <span style="font-size: 0.8rem; color: #666; font-weight: 600; display: block; margin-bottom: 5px;">TOTAL COLHIDO (HISTÓRICO)</span>
                <span style="font-size: 1.4rem; font-weight: bold; color: #673ab7;">{{ parseFloat(culturaSelecionada.total_colhido) }} {{ culturaSelecionada.unidade }}</span>
              </div>
            </div>

            <h3 style="color: var(--primary-green); margin-bottom: 15px; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 5px;">history</span> Extrato de Movimentações
            </h3>

            <div v-if="movimentacoesDaCultura.length === 0" style="color: #888; font-style: italic; padding: 10px;">
              Nenhum registro de movimentação encontrado para esta cultura.
            </div>

            <div v-else style="display: flex; flex-direction: column; gap: 12px;">
              <div
                v-for="m in movimentacoesDaCultura"
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

                <div style="font-weight: bold; font-size: 1.1rem;" :style="{ color: m.tipo_movimentacao.toUpperCase() === 'ENTRADA' ? '#2e7d32' : '#c62828' }">
                  {{ m.tipo_movimentacao.toUpperCase() === 'ENTRADA' ? '+' : '-' }}{{ parseFloat(m.quantidade) }}
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
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";

const lotes = ref([]);
const culturas = ref([]);
const colheitas = ref([]);
const movimentacoesGerais = ref([]); // Guarda todas as movimentações brutas do banco

const culturaSelecionada = ref(null); // Controla qual card de cultura está ativo
const modoCadastro = ref(false);
const busca = ref('');

const form = ref({ lote_id: '', tipo_movimentacao: 'Entrada', quantidade: 0.0, motivo: '' });

// Monta os cards resumidos do lado esquerdo
const estoqueConsolidado = computed(() => {
  const consolidados = {};

  culturas.value.forEach(c => {
    consolidados[c.id] = {
      nome_cultura: c.nome_cultura,
      cultura_id: c.id,
      saldo_total: 0,
      quantidade_lotes: 0,
      total_colhido: 0,
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

  colheitas.value.forEach(colheita => {
    const loteOrigem = lotes.value.find(l => l.id === colheita.lote_id);
    if (loteOrigem && consolidados[loteOrigem.cultura_id]) {
      consolidados[loteOrigem.cultura_id].total_colhido += parseFloat(colheita.quantidade_colhida);
      consolidados[loteOrigem.cultura_id].unidade = loteOrigem.unidade;
    }
  });

  return Object.values(consolidados).filter(item =>
    item.nome_cultura.toLowerCase().includes(busca.value.toLowerCase()) &&
    (item.saldo_total > 0 || item.total_colhido > 0)
  );
});

// Filtra as movimentações do banco que pertencem a QUALQUER lote da cultura selecionada
const movimentacoesDaCultura = computed(() => {
  if (!culturaSelecionada.value) return [];

  return movimentacoesGerais.value.filter(m => {
    const lote = lotes.value.find(l => l.id === m.lote_id);
    return lote && lote.cultura_id === culturaSelecionada.value.cultura_id;
  });
});

const carregarDadosBase = async () => {
  const headers = { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` };
  try {
    const [resLotes, resCulturas, resColheitas, resEstoque] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/lotes/', { headers }),
      fetch('http://127.0.0.1:8000/api/cultura/', { headers }),
      fetch('http://127.0.0.1:8000/api/colheita/', { headers }),
      fetch('http://127.0.0.1:8000/api/estoque/', { headers }) // Puxa a tabela de transações
    ]);

    if (resLotes.ok) lotes.value = await resLotes.json();
    if (resCulturas.ok) culturas.value = await resCulturas.json();
    if (resColheitas.ok) colheitas.value = await resColheitas.json();
    if (resEstoque.ok) movimentacoesGerais.value = await resEstoque.json();

    // Mantém a cultura selecionada atualizada caso a lista recarregue
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
  modoCadastro.value = false; // Fecha o formulário para exibir o extrato
};

const abrirFormulario = () => {
  modoCadastro.value = true;
  culturaSelecionada.value = null; // Tira o foco do card para focar no form
};

const salvarMovimentacao = async () => {
  const token = localStorage.getItem('access_token');
  const loteAlvo = lotes.value.find(l => l.id === form.value.lote_id);
  const payload = { ...form.value, unidade: loteAlvo ? loteAlvo.unidade : 'Unidades' };

  try {
    const res = await fetch('http://127.0.0.1:8000/api/estoque/', {
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

onMounted(() => carregarDadosBase());
</script>
