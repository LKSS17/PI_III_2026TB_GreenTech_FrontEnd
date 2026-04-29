<template>
  <Sidebar />

  <main class="main-content">
    <div class="weather-time-container">
      <div class="weather-info">
        <span class="material-symbols-outlined weather-icon">partly_cloudy_day</span>
        <span>24°C</span>
      </div>
      <div class="time-info">{{ relogio }}</div>
    </div>

    <header class="dash-header">
      <h1>Estoque de Sementes 🌾</h1>
      <p>Gestão de lotes de insumos e rastreabilidade inicial.</p>
    </header>

    <section class="registration-container-estoque">
      <div class="action-bar-estoque">
        <div class="search-box-estoque">
          <span class="material-symbols-outlined search-icon">search</span>
          <input type="text" class="search-input" placeholder="Buscar lote ou cultura..." />
        </div>

        <button class="btn-generate" @click="modoCadastro = true">
          <span class="material-symbols-outlined">add</span>
          Novo Lote de Semente
        </button>
      </div>

      <div class="inventory-split-view">

        <div class="seed-list-container">
          <div
            v-for="semente in sementesBD"
            :key="semente.id"
            class="mini-card"
            :class="{ active: sementeSelecionadaId === semente.id }"
            @click="selecionarSemente(semente.id)"
          >
            <div class="mini-card-header">
              <h4>{{ semente.id }}</h4>
              <span class="badge" :class="semente.statusClasse">{{ semente.statusTexto }}</span>
            </div>
            <div class="mini-card-cultura">{{ semente.cultura }}</div>
            <div class="mini-card-qty">{{ semente.quantidade }}{{ semente.unidade }}</div>
          </div>
        </div>

        <div class="seed-detail-panel">

          <div v-if="modoCadastro">
            <div class="detail-header">
              <h2><span class="material-symbols-outlined">add_circle</span> Novo Lote</h2>
              <span class="detail-header-id">ID Automático gerado no envio</span>
            </div>

            <form @submit.prevent="salvarNovaSemente">
              <div class="form-grid-layout">
                <div class="form-group full-width">
                  <label>Cultura / Tipo</label>
                  <input type="text" v-model="novoLote.cultura" required>
                </div>
                <div class="form-group full-width">
                  <label>Fornecedor</label>
                  <input type="text" v-model="novoLote.fornecedor" required>
                </div>
                <div class="form-group">
                  <label>Validade</label>
                  <input type="date" v-model="novoLote.validade" required>
                </div>
                <div class="form-group">
                  <label>Custo Unitário</label>
                  <input type="text" v-model="novoLote.custo" required>
                </div>
                <div class="form-group">
                  <label>Quantidade</label>
                  <input type="number" v-model="novoLote.quantidade" required>
                </div>
                <div class="form-group">
                  <label>Unidade</label>
                  <select v-model="novoLote.unidade" required>
                    <option value="g">Gramas (g)</option>
                    <option value="kg">Quilos (kg)</option>
                    <option value="unid.">Unidades (unid.)</option>
                  </select>
                </div>
              </div>

              <div class="form-actions-right">
                <button type="button" class="btn-outline" @click="modoCadastro = false">Cancelar</button>
                <button type="submit" class="btn-save">Registrar</button>
              </div>
            </form>
          </div>

          <div v-else-if="sementeSelecionada">
            <div class="detail-header">
              <h2><span class="material-symbols-outlined">qr_code_2</span> {{ sementeSelecionada.id }}</h2>
              <span class="badge badge-detail" :class="sementeSelecionada.statusClasse">{{ sementeSelecionada.statusTexto }}</span>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Cultura</label>
                <span>{{ sementeSelecionada.cultura }}</span>
              </div>
              <div class="detail-item">
                <label>Fornecedor</label>
                <span>{{ sementeSelecionada.fornecedor }}</span>
              </div>
              <div class="detail-item">
                <label>Validade</label>
                <span>{{ sementeSelecionada.validade }}</span>
              </div>
              <div class="detail-item full-width qty-destaque">
                <label class="qty-label">Em Estoque</label>
                <span class="qty-value">{{ sementeSelecionada.quantidade }} {{ sementeSelecionada.unidade }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-delete" @click="excluirSemente(sementeSelecionada.id)">Excluir Lote</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';

const sementesBD = ref([
  { id: "L-ALF-001", cultura: "Alface Americana", fornecedor: "Sementes Brasil Ltda", validade: "2026-10-15", custo: "12,50", quantidade: "500", unidade: "g", statusClasse: "badge-good", statusTexto: "Em Estoque" },
  { id: "L-TOM-042", cultura: "Tomate Cereja", fornecedor: "AgroTec Insumos", validade: "2026-08-02", custo: "45,00", quantidade: "50", unidade: "unid.", statusClasse: "badge-low", statusTexto: "Estoque Baixo" }
]);

const sementeSelecionadaId = ref(sementesBD.value[0].id);
const modoCadastro = ref(false);

const novoLote = ref({
  cultura: '', fornecedor: '', validade: '', custo: '', quantidade: '', unidade: 'g'
});

const sementeSelecionada = computed(() => {
  return sementesBD.value.find(s => s.id === sementeSelecionadaId.value);
});

// METODOS
const selecionarSemente = (id) => {
  sementeSelecionadaId.value = id;
  modoCadastro.value = false;
};

const salvarNovaSemente = () => {
  const idGerado = "L-" + Math.floor(Math.random() * 900 + 100);

  sementesBD.value.unshift({
    id: idGerado,
    ...novoLote.value,
    statusClasse: "badge-good",
    statusTexto: "Em Estoque"
  });

  novoLote.value = { cultura: '', fornecedor: '', validade: '', custo: '', quantidade: '', unidade: 'g' };
  selecionarSemente(idGerado);
};

const excluirSemente = (id) => {
  if (confirm(`Tem certeza que deseja excluir o lote ${id}?`)) {
    sementesBD.value = sementesBD.value.filter(s => s.id !== id);
    if (sementesBD.value.length > 0) {
      selecionarSemente(sementesBD.value[0].id);
    } else {
      sementeSelecionadaId.value = null;
    }
  }
};

// RELÓGIO
const relogio = ref('');
let intervaloRelogio;

onMounted(() => {
  intervaloRelogio = setInterval(() => {
    relogio.value = new Date().toLocaleTimeString("pt-BR", { hour12: false });
  }, 1000);
});

onUnmounted(() => {
  clearInterval(intervaloRelogio);
});
</script>
