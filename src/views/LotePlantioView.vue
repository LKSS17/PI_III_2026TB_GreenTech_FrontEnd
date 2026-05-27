<template>
  <Sidebar />
  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Lotes de Plantio</h1>
        <p>Entrada, alocação, histórico de movimentações e maturação.</p>
      </div>
      <WeatherWidget />
    </header>

    <section class="registration-container-estoque">
      <div class="action-bar-estoque">
        <div class="search-box-estoque">
          <span class="material-symbols-outlined search-icon">search</span>
          <input type="text" class="search-input" v-model="busca" placeholder="Buscar por Lote ou Cultura..." />
        </div>
        <button class="btn-generate" @click="modoCadastro = true">
          <span class="material-symbols-outlined">add</span> Alocar Novo Lote
        </button>
      </div>

      <div class="inventory-split-view">
        <div class="seed-list-container">
          <div v-if="lotesFiltrados.length === 0" class="empty-state">Nenhum lote de tubetes encontrado.</div>
          <div
            v-else
            v-for="l in lotesFiltrados"
            :key="l.id"
            class="mini-card"
            :class="{ active: loteSelecionado?.id === l.id }"
            @click="selecionar(l)"
          >
            <div class="mini-card-header">
              <h4>LOTE #{{ l.id }}</h4>
              <span class="badge badge-good">{{ traduzirStatus(l.status)}}</span>
            </div>
            <div class="mini-card-cultura">Fornecedor: {{ l.fornecedor }}</div>
            <div class="mini-card-qty"><span class="material-symbols-outlined" style="font-size: 1rem;">layers</span> Mesa ID: {{ l.mesa_id }}</div>
          </div>
        </div>

        <div class="seed-detail-panel" style="overflow-y: auto; max-height: 70vh;">

          <form v-if="modoCadastro" @submit.prevent="salvarLote" class="form-grid-layout">
            <div class="detail-header" style="grid-column: 1 / -1;">
              <h2><span class="material-symbols-outlined">local_florist</span> Recepção e Alocação</h2>
            </div>
            <div class="form-group">
              <label>Cultura (Espécie)</label>
              <select v-model="form.cultura_id" required>
                <option value="" disabled>Selecione a cultura...</option>
                <option v-for="c in culturasDisponiveis" :key="c.id" :value="c.id">{{ c.nome_cultura }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Mesa de Destino</label>
              <select v-model="form.mesa_id" required>
                <option value="" disabled>Selecione a mesa livre...</option>
                <option v-for="m in mesasDisponiveis" :key="m.id" :value="m.id">{{ m.identificacao }}</option>
              </select>
            </div>
            <div class="form-group"><label>Quantidade</label><input type="number" step="0.01" v-model="form.quantidade" required></div>
            <div class="form-group">
              <label>Unidade</label>
              <select v-model="form.unidade" required>
                <option value="Unidades">Unidades</option>
                <option value="Bandejas">Bandejas</option>
              </select>
            </div>
            <div class="form-group full-width"><label>Fornecedor (Viveiro)</label><input type="text" v-model="form.fornecedor" required></div>
            <div class="form-group"><label>Data de Plantio</label><input type="date" v-model="form.data_plantio" required></div>
            <div class="form-group"><label>Validade Estimada</label><input type="date" v-model="form.validade" required></div>
            <div class="form-actions-right" style="grid-column: 1 / -1;">
              <button type="button" class="btn-outline" @click="modoCadastro = false">Cancelar</button>
              <button type="submit" class="btn-save">Confirmar Alocação</button>
            </div>
          </form>

          <div v-else-if="loteSelecionado">
            <div class="detail-header"><h2>LOTE #{{ loteSelecionado.id }}</h2></div>

            <div v-if="progressoSelecionado" style="margin-bottom: 25px; background: rgba(255,255,255,0.5); padding: 18px; border-radius: 12px; border: 1px solid var(--glass-border);">
              <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 8px; color: var(--primary-dark); font-size: 0.95rem;">
                <span>Estágio de Maturação ({{ progressoSelecionado.nomeCultura }})</span>
                <span :style="{ color: progressoSelecionado.porcentagem >= 90 ? '#e65100' : 'var(--primary-green)' }">{{ progressoSelecionado.porcentagem }}%</span>
              </div>
              <div style="width: 100%; height: 12px; background: rgba(0,0,0,0.06); border-radius: 10px; overflow: hidden; margin-bottom: 12px;">
                <div style="height: 100%; transition: width 0.5s ease-in-out;" :style="{ width: progressoSelecionado.porcentagem + '%', background: progressoSelecionado.porcentagem >= 90 ? 'linear-gradient(90deg, #f57c00, #ffb74d)' : 'linear-gradient(90deg, #3a5a40, #588157)' }"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #555; font-weight: 500;">
                <span>Dias em campo: <strong>{{ progressoSelecionado.diasPassados }}</strong></span>
                <span v-if="progressoSelecionado.diasRestantes > 0">Restam: <strong>{{ progressoSelecionado.diasRestantes }} dias</strong></span>
                <span v-else style="color: #e65100; font-weight: 700;">Pronto para Colheita!</span>
              </div>
            </div>

            <div class="detail-grid" style="margin-bottom: 20px;">
              <div class="detail-item"><label>Data de Plantio</label><span>{{ loteSelecionado.data_plantio }}</span></div>
              <div class="detail-item"><label>Mesa Atual</label><span>Mesa {{ loteSelecionado.mesa_id }}</span></div>
              <div class="detail-item full-width qty-destaque">
                <label class="qty-label">Saldo Atual</label>
                <span class="qty-value" style="color:var(--primary-dark)">{{ parseFloat(loteSelecionado.quantidade) }} {{ loteSelecionado.unidade }}</span>
              </div>
            </div>

            <h3 style="color: var(--primary-green); margin-bottom: 15px; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <span class="material-symbols-outlined" style="vertical-align: middle;">history</span> Histórico de Movimentações
            </h3>
            <div v-if="movimentacoesDoLote.length === 0" style="color: #888; font-style: italic;">Nenhuma movimentação registrada.</div>
            <div v-else style="display: flex; flex-direction: column; gap: 10px;">
              <div v-for="m in movimentacoesDoLote" :key="m.id" style="background: #f9f9f9; padding: 12px; border-radius: 8px; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="badge" :class="m.tipo_movimentacao.toLowerCase() === 'entrada' ? 'badge-good' : 'badge-out'" style="margin-right: 10px;">{{ m.tipo_movimentacao.toUpperCase() }}</span>
                  <span style="font-weight: 600; color: #555;">{{ m.motivo }}</span>
                  <div style="font-size: 0.8rem; color: #888; margin-top: 4px;">{{ new Date(m.data_movimentacao).toLocaleString('pt-BR') }}</div>
                </div>
                <div style="font-weight: bold; font-size: 1.1rem;" :style="{ color: m.tipo_movimentacao.toLowerCase() === 'entrada' ? '#2e7d32' : '#c62828' }">
                  {{ m.tipo_movimentacao.toLowerCase() === 'entrada' ? '+' : '-' }}{{ parseFloat(m.quantidade) }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="detalhe-placeholder" style="text-align: center; color: #aaa; margin-top: 100px;">
            <span class="material-symbols-outlined" style="font-size: 3rem;">touch_app</span>
            <p>Selecione um lote para ver os detalhes, histórico e maturação.</p>
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

const isGerente = ref(false);
const lotes = ref([]);
const culturasDisponiveis = ref([]);
const mesasDisponiveis = ref([]);
const movimentacoesGerais = ref([]);
const loteSelecionado = ref(null);
const modoCadastro = ref(false);
const busca = ref('');
const form = ref({ cultura_id: '', mesa_id: '', data_plantio: new Date().toISOString().split('T')[0], status: 'AT', quantidade: 0, unidade: 'Unidades', fornecedor: '', validade: '' });

const lotesFiltrados = computed(() => lotes.value.filter(l => l.id.toString().includes(busca.value) || l.fornecedor.toLowerCase().includes(busca.value.toLowerCase())));
const movimentacoesDoLote = computed(() => !loteSelecionado.value ? [] : movimentacoesGerais.value.filter(m => m.lote_id === loteSelecionado.value.id));

const progressoSelecionado = computed(() => {
  if (!loteSelecionado.value) return null;
  const cultura = culturasDisponiveis.value.find(c => c.id === loteSelecionado.value.cultura_id);
  if (!cultura || !loteSelecionado.value.data_plantio) return { porcentagem: 0, diasPassados: 0, diasRestantes: 0, nomeCultura: 'Desconhecida' };

  const dataPlantio = new Date(loteSelecionado.value.data_plantio);
  const diasPassados = Math.max(0, Math.floor((new Date() - dataPlantio) / (1000 * 60 * 60 * 24)));
  const porcentagem = Math.min(100, Math.max(0, Math.round((diasPassados / cultura.tempo_medio_colheita) * 100)));
  const diasRestantes = Math.max(0, cultura.tempo_medio_colheita - diasPassados);
  return { porcentagem, diasPassados, diasRestantes, nomeCultura: cultura.nome_cultura };
});

const carregarDados = async () => {
  const h = { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` };
  try {
    const [resLotes, resCulturas, resMesas, resEstoque] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/lotes/', { headers: h }),
      fetch('http://127.0.0.1:8000/api/cultura/', { headers: h }),
      fetch('http://127.0.0.1:8000/api/mesa/', { headers: h }),
      fetch('http://127.0.0.1:8000/api/estoque/', { headers: h })
    ]);
    if (resLotes.ok) lotes.value = await resLotes.json();
    if (resCulturas.ok) culturasDisponiveis.value = await resCulturas.json();
    if (resMesas.ok) mesasDisponiveis.value = await resMesas.json();
    if (resEstoque.ok) movimentacoesGerais.value = await resEstoque.json();
  } catch (err) { console.error(err); }
};

const carregarUsuarioLogado = async () => {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch('http://127.0.0.1:8000/api/funcionarios/me/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const dadosUsuario = await res.json();
      isGerente.value = dadosUsuario.is_gerente;
    }
  } catch (err) {
    console.error(err);
  }
};

const selecionar = (l) => { loteSelecionado.value = l; modoCadastro.value = false; };

const salvarLote = async () => {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/lotes/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }, body: JSON.stringify(form.value) });
    if (res.ok) { alert("Lote alocado com sucesso!"); modoCadastro.value = false; carregarDados(); }
    else { alert("Erro ao alocar o lote."); }
  } catch (err) { console.error(err); }
};

const mapaStatus = {
  'ES': 'Em Estoque',
  'BX': 'Estoque Baixo',
  'DI': 'Disponível',
  'AT': 'Ativo',
  'CO': 'Colhido',
  'PE': 'Perdido'
};

const traduzirStatus = (sigla) => {
  return mapaStatus[sigla] || sigla; // Se não achar a sigla, retorna o original por segurança
};

onMounted(() => {
  carregarDados();
  carregarUsuarioLogado();
});

</script>
