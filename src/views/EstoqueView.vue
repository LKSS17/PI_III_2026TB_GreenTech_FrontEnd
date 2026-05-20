<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Estoque de Tubetes 🪴</h1>
        <p>Gestão de lotes de mudas (tubetes) e rastreabilidade inicial.</p>
      </div>
      <WeatherWidget/>
    </header>

    <section class="registration-container-estoque">
      <div class="action-bar-estoque">
        <div class="search-box-estoque">
          <span class="material-symbols-outlined search-icon">search</span>
          <input type="text" class="search-input" placeholder="Buscar lote ou cultura..." />
        </div>

        <button class="btn-generate" @click="modoCadastro = true">
          <span class="material-symbols-outlined">add</span>
          Novo Lote de Tubetes
        </button>
      </div>

      <div class="inventory-split-view">
        <div class="seed-list-container">
          <div
            v-for="lote in lotesTubetes"
            :key="lote.id"
            class="mini-card"
            :class="{ active: loteSelecionadoId === lote.id }"
            @click="selecionarLote(lote.id)"
          >
            <div class="mini-card-header">
              <h4>LOTE-{{ lote.id }}</h4>
              <span class="badge" :class="lote.statusClasse">{{ lote.statusTexto }}</span>
            </div>
            <div class="mini-card-cultura">{{ lote.cultura }}</div>
            <div class="mini-card-qty">{{ lote.quantidade }} {{ lote.unidade }}</div>
          </div>
        </div>

        <div class="seed-detail-panel">
          <div v-if="modoCadastro">
            <div class="detail-header">
              <h2><span class="material-symbols-outlined">add_circle</span> Novo Lote (Tubetes)</h2>
              <span class="detail-header-id">ID Automático gerado no envio</span>
            </div>

            <form @submit.prevent="salvarNovoLote">
              <div class="form-grid-layout">
                <div class="form-group full-width">
                  <label>Cultura (ID)</label>
                  <input type="number" v-model="novoLote.cultura_id" placeholder="ID da Cultura" required>
                </div>
                <div class="form-group full-width">
                  <label>Fornecedor</label>
                  <input type="text" v-model="novoLote.fornecedor" required>
                </div>

                <div class="form-group">
                  <label>Data de Recebimento</label>
                  <input type="date" v-model="novoLote.data_plantio" required>
                </div>

                <div class="form-group">
                  <label>Validade Estimada</label>
                  <input type="date" v-model="novoLote.validade">
                </div>

                <div class="form-group">
                  <label>Quantidade de Tubetes</label>
                  <input type="number" v-model="novoLote.quantidade" required>
                </div>

                <div class="form-group">
                  <label>Unidade</label>
                  <select v-model="novoLote.unidade" required>
                    <option value="unid.">Unidades (Tubetes)</option>
                    <option value="bandejas">Bandejas</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Status</label>
                  <select v-model="novoLote.status" required>
                    <option value="ES">Em Estoque</option>
                    <option value="BX">Estoque Baixo</option>
                    <option value="DI">Disponível</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Mesa Destino (ID)</label>
                  <input type="number" v-model="novoLote.mesa_id" placeholder="Ex: 1" required>
                </div>
              </div>

              <div class="form-actions-right">
                <button type="button" class="btn-outline" @click="modoCadastro = false">Cancelar</button>
                <button type="submit" class="btn-save">Registrar Tubetes</button>
              </div>
            </form>
          </div>

          <div v-else-if="loteSelecionado">
            <div class="detail-header">
              <h2><span class="material-symbols-outlined">qr_code_2</span> LOTE-{{ loteSelecionado.id }}</h2>
              <span class="badge badge-detail" :class="loteSelecionado.statusClasse">{{ loteSelecionado.statusTexto }}</span>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Cultura</label>
                <span>{{ loteSelecionado.cultura }}</span>
              </div>
              <div class="detail-item">
                <label>Fornecedor</label>
                <span>{{ loteSelecionado.fornecedor }}</span>
              </div>
              <div class="detail-item">
                <label>Validade Estimada</label>
                <span>{{ loteSelecionado.validade || 'N/A' }}</span>
              </div>
              <div class="detail-item full-width qty-destaque">
                <label class="qty-label">Tubetes em Estoque</label>
                <span class="qty-value">{{ loteSelecionado.quantidade }} {{ loteSelecionado.unidade }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-delete" @click="excluirLote(loteSelecionado.id)">Descartar Lote</button>
            </div>
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

const API_URL = 'http://127.0.0.1:8000/api/lotes/';

const lotesTubetes = ref([]);
const loteSelecionadoId = ref(null);
const modoCadastro = ref(false);

const novoLote = ref({
  cultura_id: '',
  mesa_id: '',
  data_plantio: '',
  status: 'ES',
  quantidade: '',
  unidade: 'unid.',
  fornecedor: '',
  validade: ''
});

const loteSelecionado = computed(() => {
  return lotesTubetes.value.find(l => l.id === loteSelecionadoId.value);
});

const buscarLotes = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const resposta = await fetch(API_URL, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (resposta.ok) {
      const dados = await resposta.json();
      lotesTubetes.value = dados.map(lote => {
        const statusFormatado = formatarStatus(lote.status);
        return { ...lote, ...statusFormatado };
      });
      if (lotesTubetes.value.length > 0) loteSelecionadoId.value = lotesTubetes.value[0].id;
    }
  } catch (error) {
    console.error("Erro ao buscar tubetes:", error);
  }
};

const selecionarLote = (id) => {
  loteSelecionadoId.value = id;
  modoCadastro.value = false;
};

const formatarStatus = (status) => {
  if (status === 'BX') return { statusClasse: 'badge-low', statusTexto: 'Estoque Baixo' };
  if (status === 'ES' || status === 'DI') return { statusClasse: 'badge-good', statusTexto: 'Disponível' };
  return { statusClasse: 'badge-good', statusTexto: status };
};

const salvarNovoLote = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(novoLote.value)
    });

    if (resposta.ok) {
      alert("Lote de Tubetes registrado!");
      buscarLotes();
      modoCadastro.value = false;
    } else {
      alert("Erro ao cadastrar lote.");
    }
  } catch (error) {
    console.error(error);
  }
};

const excluirLote = async (id) => {
  if (confirm(`Descartar o lote de tubetes ${id}?`)) {
    const token = localStorage.getItem('access_token');
    await fetch(`${API_URL}${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    buscarLotes();
  }
};

onMounted(() => buscarLotes());
</script>

<style scoped>
/* --- LAYOUT DO ESTOQUE --- */
.registration-container-estoque {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 10px 40px 40px 40px;
}

.action-bar-estoque {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 30px auto;
}

/* CAIXA DE BUSCA ESPECÍFICA */
.search-box-estoque {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 0 15px;
  width: 350px;
  transition: all 0.3s;
}
.search-box-estoque:focus-within {
  border-color: var(--primary-green);
  box-shadow: 0 0 0 4px rgba(58, 90, 64, 0.1);
}
.search-icon {
  color: var(--primary-green);
}
.search-input {
  width: 100%;
  background: transparent;
  border: none;
  padding: 12px 10px;
  outline: none;
  font-size: 0.95rem;
}

/* SPLIT VIEW (LISTA X DETALHES) */
.inventory-split-view {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
}

/* COLUNA DA ESQUERDA (LISTA DE MINI CARDS) */
.seed-list-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 10px;
}
.seed-list-container::-webkit-scrollbar { width: 6px; }
.seed-list-container::-webkit-scrollbar-thumb { background: rgba(58, 90, 64, 0.3); border-radius: 10px; }

.mini-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 15px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mini-card:hover { transform: translateX(5px); border-color: var(--primary-green); }
.mini-card.active {
  border-color: var(--primary-green);
  background: rgba(255, 255, 255, 0.9);
  border-left: 5px solid var(--primary-green);
}

.mini-card-header { display: flex; justify-content: space-between; align-items: center; }
.mini-card-header h4 { font-family: "Poppins", sans-serif; font-size: 1rem; color: var(--primary-dark); }
.mini-card-cultura { font-size: 0.85rem; color: var(--text-light); font-weight: 600; }
.mini-card-qty { font-size: 0.85rem; color: var(--primary-green); font-weight: 700; margin-top: 5px; }

/* COLUNA DA DIREITA (PAINEL DE DETALHES) */
.seed-detail-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  min-height: 400px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 20px;
  margin-bottom: 20px;
}
.detail-header h2 { font-family: "Poppins", sans-serif; color: var(--primary-green); font-size: 1.8rem; display: flex; align-items: center; gap: 10px; }
.detail-header-id { color: #777; font-weight: 600; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}
.detail-item {
  background: rgba(255, 255, 255, 0.5);
  padding: 15px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.03);
}
.detail-item label { display: block; font-size: 0.8rem; color: #777; font-weight: 700; text-transform: uppercase; margin-bottom: 5px; }
.detail-item span { font-size: 1.1rem; color: var(--primary-dark); font-weight: 600; }
.detail-item.full-width { grid-column: 1 / -1; }

.qty-destaque { background: rgba(58, 90, 64, 0.1); border: 1px solid rgba(58, 90, 64, 0.2); }
.qty-label { color: var(--primary-green) !important; }
.qty-value { font-size: 1.5rem !important; color: var(--primary-green) !important; }

/* FORMULÁRIO INTERNO */
.form-grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-actions-right { display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 20px; }

@media (max-width: 768px) {
  .inventory-split-view { grid-template-columns: 1fr; }
  .form-grid-layout { grid-template-columns: 1fr; }
  .action-bar-estoque { flex-direction: column; gap: 15px; }
  .search-box-estoque { width: 100%; }
}
</style>
