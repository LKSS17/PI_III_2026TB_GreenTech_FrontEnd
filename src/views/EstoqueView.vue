<template>
  <Sidebar />

  <main class="main-content">

    <header class="dash-header">
      <div class="header-titles">
        <h1>Estoque de Sementes 🌾</h1>
        <p>Gestão de lotes de insumos e rastreabilidade inicial.</p>
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
                  <label>Data de Plantio</label>
                  <input type="date" v-model="novoLote.dataPlantio" required>
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
                  <label>Custo Total</label>
                  <input type="number" step="0.01" v-model="novoLote.custoTotal" required>
                </div>

                <div class="form-group">
                  <label>Status</label>
                  <select v-model="novoLote.status" required>
                    <option value="ES">Em Estoque</option>
                    <option value="BX">Estoque Baixo</option>
                    <option value="ES">Disponível</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>ID da Estufa</label>
                  <input type="number" v-model="novoLote.estufaId" required>
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

    <Footer/>

  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";

const API_URL = 'http://127.0.0.1:8000/api/lotes/';

const sementesBD = ref([]);

const sementeSelecionadaId = ref(null);
const modoCadastro = ref(null);
const salvando = ref(null);

const novoLote = ref({
  cultura: '',
  fornecedor: '',
  dataPlantio: '',
  validade: '',
  custo: '',
  status: 'ES',
  custoTotal: '',
  estufaId: '',
  quantidade: '',
  unidade: 'g'
});

const sementeSelecionada = computed(() => {
  return sementesBD.value.find(s => s.id === sementeSelecionadaId.value);
});

// METODOS
const buscarSementes = async () => {
  try{
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Sessão expirada. Faça login novamente.');
      return;
    }

    const resposta = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.log('Status:', resposta.status);
      console.log('Erro do backend:', erro);

      alert("Houve algum erro ao buscar as sementes.");

      throw new Error('Erro ao buscar sementes');
    }

    const dados = await resposta.json();

    sementesBD.value = dados.map((semente) => {
      const statusFormatado = formatarStatus(semente.status);

      return {
        id: semente.id,
        cultura: semente.cultura,
        fornecedor: semente.fornecedor,
        validade: semente.validade,
        custo: semente.custo,
        quantidade: semente.quantidade,
        unidade: semente.unidade,
        statusClasse: statusFormatado.statusClasse,
        statusTexto: statusFormatado.statusTexto
      };
    });

    if (sementesBD.value.length > 0) {
      sementeSelecionadaId.value = sementesBD.value[0].id;
    }
  } catch (error) {
    console.error(error);
    alert('Não foi possível carregar os lotes de sementes.');
  }
};

const selecionarSemente = (id) => {
  sementeSelecionadaId.value = id;
  modoCadastro.value = false;
};

const formatarStatus = (status) => {
  if (status === 'BX') {
    return {
      statusClasse: 'badge-low',
      statusTexto: 'Estoque Baixo'
    };
  }

  return {
    statusClasse: 'badge-good',
    statusTexto: 'Em Estoque'
  };
};

const limparFormulario = () => {
  novoLote.value = {
    cultura: '',
    fornecedor: '',
    dataPlantio: '',
    validade: '',
    custo: '',
    status: 'ES',
    custoTotal: '',
    estufaId: '',
    quantidade: '',
    unidade: 'g'
  };
};

const salvarNovaSemente = async () => {
  try {
    salvando.value = true;

    const token = localStorage.getItem('access_token');

    if (!token) {
      alert('Sessão expirada. Faça login novamente.');
      return;
    }

    const payload = {
      estufa: Number(novoLote.value.estufaId),
      cultura: novoLote.value.cultura,
      fornecedor: novoLote.value.fornecedor,
      data_plantio: novoLote.value.dataPlantio,
      validade: novoLote.value.validade,
      status: novoLote.value.status,
      custo: Number(String(novoLote.value.custo).replace(',', '.')),
      custo_total: Number(novoLote.value.custoTotal),
      quantidade: Number(novoLote.value.quantidade),
      unidade: novoLote.value.unidade
    };

    const resposta = await fetch('http://127.0.0.1:8000/api/lotes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.log('Status:', resposta.status);
      console.log('Erro do backend:', erro);
      throw new Error('Erro ao cadastrar nova semente');
    }

    const sementeCadastrada = await resposta.json();

    sementesBD.value.unshift({
      id: sementeCadastrada.id,
      cultura: sementeCadastrada.cultura,
      fornecedor: sementeCadastrada.fornecedor,
      validade: sementeCadastrada.validade,
      custo: sementeCadastrada.custo,
      quantidade: sementeCadastrada.quantidade,
      unidade: sementeCadastrada.unidade,
      statusClasse: sementeCadastrada.status === 'BX' ? 'badge-low' : 'badge-good',
      statusTexto: sementeCadastrada.status === 'BX' ? 'Estoque Baixo' : 'Em Estoque'
    });

    limparFormulario();
    selecionarSemente(sementeCadastrada.id);
  } catch (error) {
    console.error(error);
    alert('Não foi possível cadastrar o lote de semente.');
  } finally {
    salvando.value = false;
  }
};

const excluirSemente = (id) => {

  const token = localStorage.getItem('access_token');

  if (!token) {
    alert('Sessão expirada. Faça login novamente.');
    return;
  }

  if (confirm(`Tem certeza que deseja excluir o lote ${id}?`)) {
    fetch(`http://127.0.0.1:8000/api/lotes/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          alert("Houve algum erro ao excluir a semente.")
          throw new Error('Erro ao excluir semente');
        } else {
          sementesBD.value = sementesBD.value.filter(s => s.id !== id);
          if (sementesBD.value.length > 0) {
            selecionarSemente(sementesBD.value[0].id);
          } else {
            sementeSelecionadaId.value = null;
          }
        }
      })
  }
}

// RELÓGIO
const relogio = ref('');
let intervaloRelogio;

onMounted(() => {
  buscarSementes();

  intervaloRelogio = setInterval(() => {
    relogio.value = new Date().toLocaleTimeString("pt-BR", { hour12: false });
  }, 1000);
});

onUnmounted(() => {
  clearInterval(intervaloRelogio);
});
</script>

<style scoped>
/* --- WIDGET DE CLIMA E HORA --- */
.weather-time-container {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  padding: 10px 20px;
  border-radius: 15px;
  width: fit-content;
  margin: 20px 0 0 40px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-green);
  font-weight: 700;
  border-right: 2px solid var(--glass-border);
  padding-right: 15px;
}
.weather-icon {
  color: var(--accent-terracota);
  font-size: 1.8rem;
}
.time-info {
  color: var(--primary-dark);
  font-family: "Poppins", sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
}

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
