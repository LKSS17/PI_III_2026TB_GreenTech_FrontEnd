<template>
  <Sidebar />
  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Lotes de Plantio</h1>
        <p>Entrada de tubetes do fornecedor e alocação nas mesas de cultivo.</p>
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
          <div v-if="lotesFiltrados.length === 0" class="empty-state">Nenhum lote de tubetes em desenvolvimento.</div>
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
              <span class="badge badge-good">{{ l.status }}</span>
            </div>
            <div class="mini-card-cultura">Cultura ID: {{ l.cultura }}</div>
            <div class="mini-card-qty"><span class="material-symbols-outlined" style="font-size: 1rem;">layers</span> Mesa ID: {{ l.mesa }}</div>
          </div>
        </div>

        <div class="seed-detail-panel">

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
                <option v-for="m in mesasDisponiveis" :key="m.id" :value="m.id">{{ m.identificacao }} ({{ m.estufa_nome }})</option>
              </select>
            </div>

            <div class="form-group">
              <label>Quantidade de Tubetes</label>
              <input type="number" step="0.01" v-model="form.quantidade" required>
            </div>

            <div class="form-group">
              <label>Unidade</label>
              <select v-model="form.unidade" required>
                <option value="Unidades">Unidades</option>
                <option value="Bandejas">Bandejas</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Fornecedor (Viveiro)</label>
              <input type="text" v-model="form.fornecedor" placeholder="Ex: Viveiro Boa Esperança" required>
            </div>

            <div class="form-group">
              <label>Data de Plantio / Alocação</label>
              <input type="date" v-model="form.data_plantio" required>
            </div>

            <div class="form-group">
              <label>Validade Estimada</label>
              <input type="date" v-model="form.validade" required>
            </div>

            <div class="form-actions-right" style="grid-column: 1 / -1;">
              <button type="button" class="btn-outline" @click="modoCadastro = false">Cancelar</button>
              <button type="submit" class="btn-save">Confirmar Alocação</button>
            </div>
          </form>

          <div v-else-if="loteSelecionado">
            <div class="detail-header">
              <h2>Rastreabilidade: LOTE #{{ loteSelecionado.id }}</h2>
            </div>

            <div class="detail-grid">
              <div class="detail-item"><label>Data de Plantio</label><span>{{ loteSelecionado.data_plantio }}</span></div>
              <div class="detail-item"><label>Validade</label><span>{{ loteSelecionado.validade }}</span></div>
              <div class="detail-item"><label>Fornecedor</label><span>{{ loteSelecionado.fornecedor }}</span></div>
              <div class="detail-item full-width qty-destaque">
                <label class="qty-label">Tubetes Alocados</label>
                <span class="qty-value" style="color:var(--primary-dark)">{{ parseFloat(loteSelecionado.quantidade) }} {{ loteSelecionado.unidade }}</span>
              </div>
            </div>

            <div style="margin-top: 25px; padding: 20px; background: rgba(58, 90, 64, 0.05); border-radius: 12px; border: 1px dashed var(--primary-green); text-align: center;">
              <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--primary-green);">qr_code_scanner</span>
              <p style="margin-top: 10px; font-weight: 600; color: var(--primary-dark);">Lote Rastreável via QR Code.</p>
              <p style="font-size: 0.85rem; color: #666;">Aguardando o ciclo de crescimento para encerramento na aba de Colheita.</p>
            </div>
          </div>

          <div v-else class="detalhe-placeholder" style="text-align: center; color: #aaa; margin-top: 100px;">
            <span class="material-symbols-outlined" style="font-size: 3rem;">touch_app</span>
            <p>Selecione um lote ao lado ou aloque um novo.</p>
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
const culturasDisponiveis = ref([]);
const mesasDisponiveis = ref([]);

const loteSelecionado = ref(null);
const modoCadastro = ref(false);
const busca = ref('');

const form = ref({
  cultura_id: '',
  mesa_id: '',
  data_plantio: new Date().toISOString().split('T')[0],
  status: 'AT',
  quantidade: 0,
  unidade: 'Unidades',
  fornecedor: '',
  validade: ''
});

const lotesFiltrados = computed(() => {
  return lotes.value.filter(l =>
    l.id.toString().includes(busca.value) ||
    l.fornecedor.toLowerCase().includes(busca.value.toLowerCase())
  );
});

const carregarDados = async () => {
  const token = localStorage.getItem('access_token');
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [resLotes, resCulturas, resMesas] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/lotes/', { headers }), // Endpoint plural ou singular dependendo do seu roteador
      fetch('http://127.0.0.1:8000/api/cultura/', { headers }),
      fetch('http://127.0.0.1:8000/api/mesa/', { headers })
    ]);

    if (resLotes.ok) lotes.value = await resLotes.json();
    if (resCulturas.ok) culturasDisponiveis.value = await resCulturas.json();
    if (resMesas.ok) mesasDisponiveis.value = await resMesas.json();
  } catch (err) {
    console.error("Erro na carga de dados:", err);
  }
};

const selecionar = (l) => {
  loteSelecionado.value = l;
  modoCadastro.value = false;
};

const salvarLote = async () => {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch('http://127.0.0.1:8000/api/lotes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form.value)
    });

    if (res.ok) {
      alert("Lote de tubetes alocado na mesa com sucesso!");
      modoCadastro.value = false;
      carregarDados();
    } else {
      alert("Erro ao alocar o lote. Verifique se a mesa selecionada existe.");
    }
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  carregarDados();
});
</script>
