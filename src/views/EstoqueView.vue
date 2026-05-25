<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Movimentação de Estoque e Insumos</h1>
        <p>Histórico de entradas, saídas, ajustes e auditoria de desperdícios por lote.</p>
      </div>
      <WeatherWidget />
    </header>

    <section class="registration-container-estoque">
      <div class="action-bar-estoque">
        <div class="search-box-estoque">
          <span class="material-symbols-outlined search-icon">search</span>
          <input type="text" class="search-input" v-model="busca" placeholder="Buscar por motivo ou lote..." />
        </div>
        <button class="btn-generate" @click="modoCadastro = true">
          <span class="material-symbols-outlined">swap_horiz</span> Registrar Movimentação
        </button>
      </div>

      <div class="inventory-split-view">
        <div class="seed-list-container">
          <div v-if="movimentacoesFiltradas.length === 0" class="empty-state">Nenhuma movimentação registradada no estoque.</div>
          <div
            v-else
            v-for="m in movimentacoesFiltradas"
            :key="m.id"
            class="mini-card"
            :class="{ active: movimentacaoSelecionada?.id === m.id }"
            @click="selecionar(m)"
          >
            <div class="mini-card-header">
              <h4>LOTE #{{ m.lote }}</h4>
              <span class="badge" :class="m.tipo_movimentacao === 'Entrada' ? 'badge-good' : 'badge-out'">
                {{ m.tipo_movimentacao }}
              </span>
            </div>
            <div class="mini-card-cultura">Motivo: {{ m.motivo }}</div>
            <div class="mini-card-qty">
              <span class="material-symbols-outlined" style="font-size: 1rem;">inventory</span>
              {{ parseFloat(m.quantidade) }} {{ m.unidade }}
            </div>
          </div>
        </div>

        <div class="seed-detail-panel">

          <form v-if="modoCadastro" @submit.prevent="salvarMovimentacao" class="form-grid-layout">
            <div class="detail-header" style="grid-column: 1 / -1;">
              <h2><span class="material-symbols-outlined">add_to_photos</span> Nova Movimentação</h2>
            </div>

            <div class="form-group">
              <label>Lote Alvo</label>
              <select v-model="form.lote" required>
                <option value="" disabled>Selecione o lote...</option>
                <option v-for="l in lotes" :key="l.id" :value="l.id">Lote #{{ l.id }} (Mesa {{ l.mesa }})</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tipo de Movimentação</label>
              <select v-model="form.tipo_movimentacao" required>
                <option value="Entrada">Entrada (Abastecimento)</option>
                <option value="Saída">Saída (Consumo/Uso)</option>
                <option value="Perda">Perda / Scrap (Desperdício)</option>
                <option value="Ajuste">Ajuste de Inventário</option>
              </select>
            </div>

            <div class="form-group">
              <label>Quantidade</label>
              <input type="number" step="0.01" v-model="form.quantidade" min="0.01" required>
            </div>

            <div class="form-group">
              <label>Unidade de Medida</label>
              <select v-model="form.unidade" required>
                <option value="Unidades">Unidades (Tubetes)</option>
                <option value="Bandejas">Bandejas</option>
                <option value="Kg">Quilos (Sementes/Insumos)</option>
                <option value="Litros">Litros (Nutrientes)</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Motivo da Movimentação</label>
              <input type="text" v-model="form.motivo" placeholder="Ex: Quebra de mudas no transporte, ajuste manual..." required>
            </div>

            <div class="form-group full-width">
              <label>Observações Detalhadas</label>
              <textarea v-model="form.observacoes" rows="3" placeholder="Informações adicionais para auditoria técnica..."></textarea>
            </div>

            <div class="form-actions-right" style="grid-column: 1 / -1;">
              <button type="button" class="btn-outline" @click="modoCadastro = false">Cancelar</button>
              <button type="submit" class="btn-save">Registrar Lançamento</button>
            </div>
          </form>

          <div v-else-if="movimentacaoSelecionada">
            <div class="detail-header">
              <h2>Registro de Movimentação #{{ movimentacaoSelecionada.id }}</h2>
              <span class="badge" :class="movimentacaoSelecionada.tipo_movimentacao === 'Entrada' ? 'badge-good' : 'badge-out'">
                {{ movimentacaoSelecionada.tipo_movimentacao }}
              </span>
            </div>

            <div class="detail-grid">
              <div class="detail-item"><label>Lote Vinculado</label><span>LOTE #{{ movimentacaoSelecionada.lote }}</span></div>
              <div class="detail-item"><label>Data/Hora do Registro</label><span>{{ formatarData(movimentacaoSelecionada.data_movimentacao) }}</span></div>
              <div class="detail-item full-width"><label>Motivo / Justificativa</label><span>{{ movimentacaoSelecionada.motivo }}</span></div>

              <div class="detail-item full-width qty-destaque">
                <label class="qty-label">Volume Movimentado</label>
                <span class="qty-value" :style="{ color: movimentacaoSelecionada.tipo_movimentacao === 'Entrada' ? '#2e7d32' : '#c62828' }">
                  {{ movimentacaoSelecionada.tipo_movimentacao === 'Entrada' ? '+' : '-' }}
                  {{ parseFloat(movimentacaoSelecionada.quantidade) }} {{ movimentacaoSelecionada.unidade }}
                </span>
              </div>

              <div class="detail-item full-width" v-if="movimentacaoSelecionada.observacoes">
                <label>Notas de Auditoria</label>
                <p style="background: #f9f9f9; padding: 12px; border-radius: 8px; font-size: 0.9rem; color: #555; margin-top: 5px; border: 1px solid #eee;">
                  {{ movimentacaoSelecionada.observacoes }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="detalhe-placeholder" style="text-align: center; color: #aaa; margin-top: 120px;">
            <span class="material-symbols-outlined" style="font-size: 3.5rem;">receipt_long</span>
            <p>Selecione um registo de movimentação para auditar os detalhes ou faça um novo lançamento.</p>
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

const movimentacoes = ref([]);
const lotes = ref([]);

const movimentacaoSelecionada = ref(null);
const modoCadastro = ref(false);
const busca = ref('');

const form = ref({
  lote: '',
  tipo_movimentacao: 'Entrada',
  quantidade: 0.0,
  unidade: 'Unidades',
  motivo: '',
  observacoes: ''
});

const movimentacoesFiltradas = computed(() => {
  return movimentacoes.value.filter(m =>
    m.lote.toString().includes(busca.value) ||
    m.motivo.toLowerCase().includes(busca.value.toLowerCase())
  );
});

const carregarDadosEstoque = async () => {
  const token = localStorage.getItem('access_token');
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [resEstoque, resLotes] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/estoque/', { headers }),
      fetch('http://127.0.0.1:8000/api/lotePlantio/', { headers })
    ]);

    if (resEstoque.ok) movimentacoes.value = await resEstoque.json();
    if (resLotes.ok) lotes.value = await resLotes.json();
  } catch (err) {
    console.error("Erro ao sincronizar dados de estoque:", err);
  }
};

const selecionar = (m) => {
  movimentacaoSelecionada.value = m;
  modoCadastro.value = false;
};

const salvarMovimentacao = async () => {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch('http://127.0.0.1:8000/api/estoque/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form.value)
    });

    if (res.ok) {
      alert("Movimentação de estoque auditada e gravada!");
      modoCadastro.value = false;
      // Reseta formulário
      form.value = { lote: '', tipo_movimentacao: 'Entrada', quantidade: 0.0, unidade: 'Unidades', motivo: '', observacoes: '' };
      await carregarDadosEstoque();
    } else {
      alert("Erro ao registar movimentação. Verifique os dados relacionais.");
    }
  } catch (err) {
    console.error(err);
  }
};

const formatarData = (stringData) => {
  return new Date(stringData).toLocaleString('pt-BR');
};

onMounted(() => {
  carregarDadosEstoque();
});
</script>
