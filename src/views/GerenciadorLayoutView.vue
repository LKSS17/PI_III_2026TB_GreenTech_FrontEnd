<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Gêmeo Virtual 3D</h1>
        <p>Construção espacial das Estufas e alocação de Mesas de cultivo.</p>
      </div>
      <WeatherWidget />
    </header>

    <section class="layout-control-container">

      <div class="control-panel-card">
        <h3 style="color: var(--primary-green); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined">add_box</span> Novo Elemento Espacial
        </h3>

        <div class="tab-actions">
          <button class="btn-tab" :class="{ active: tipoCadastro === 'estufa' }" @click="tipoCadastro = 'estufa'">Nova Estufa</button>
          <button class="btn-tab" :class="{ active: tipoCadastro === 'mesa' }" @click="tipoCadastro = 'mesa'">Mesa Interna</button>
        </div>

        <form v-if="tipoCadastro === 'estufa'" @submit.prevent="cadastrarEstufa" class="spatial-form">
          <div class="form-group">
            <label>Nome do Setor / Estufa</label>
            <input type="text" v-model="novaEstufa.nome_setor" placeholder="Ex: Setor Norte" required />
          </div>
          <div class="form-group">
            <label>Tipo de Cultivo</label>
            <input type="text" v-model="novaEstufa.tipo_cultivo" placeholder="Ex: Hidroponia" required />
          </div>
          <div class="form-group">
            <label>Capacidade Máxima (Lotes)</label>
            <input type="number" v-model="novaEstufa.capacidade_maxima" min="0" step="0.01" required />
          </div>
          <button type="submit" class="btn-generate full-width" style="margin-top: 15px;">Construir Estufa</button>
        </form>

        <form v-else @submit.prevent="cadastrarMesa" class="spatial-form">
          <div class="form-group">
            <label>Estufa de Destino</label>
            <select v-model="novaMesa.estufa" required>
              <option value="" disabled>Selecione a estufa...</option>
              <option v-for="e in estufas" :key="e.id" :value="e.id">{{ e.nome_setor }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Identificação da Mesa</label>
            <input type="text" v-model="novaMesa.identificacao" placeholder="Ex: M-01" required />
          </div>
          <div class="form-group">
            <label>Capacidade Máxima (Tubetes)</label>
            <input type="number" v-model="novaMesa.capacidade_maxima" min="0" step="0.01" required />
          </div>
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="novaMesa.observacoes" placeholder="Notas sobre a mesa (opcional)" rows="3"></textarea>
          </div>
          <button type="submit" class="btn-generate full-width" style="margin-top: 15px;">Instalar Mesa</button>
        </form>
      </div>

      <div class="canvas-3d-card">
        <div class="canvas-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="color: var(--primary-dark);">Projeção Isométrica</h3>
          <span class="badge badge-good" style="padding: 5px 10px;">Renderização Ativa</span>
        </div>

        <div v-if="estufas.length === 0" style="text-align: center; color: #aaa; padding: 40px;">
          Nenhuma estufa construída ainda.
        </div>

        <div v-else class="scene-3d-wrapper">
          <div class="isometric-grid">
            <div
              v-for="estufa in estufas"
              :key="estufa.id"
              class="cube-estufa"
              :class="{ selected: estufaSelecionada?.id === estufa.id }"
              @click="selecionarEstufa(estufa)"
            >
              <div class="cube-face face-top">
                <span class="cube-label">{{ estufa.nome_setor }}</span>
              </div>
              <div class="cube-face face-front"></div>
              <div class="cube-face face-side"></div>
            </div>
          </div>
        </div>

        <div v-if="estufaSelecionada" class="inner-layout-details" style="margin-top: 30px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 20px;">

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="color: var(--primary-green); margin: 0;">Layout Interno — {{ estufaSelecionada.nome_setor }}</h4>
            <button
              @click="excluirEstufa(estufaSelecionada.id)"
              class="btn-danger-outline"
              style="padding: 6px 12px; font-size: 0.8rem;"
            >
              <span class="material-symbols-outlined" style="font-size: 1.1rem;">delete_forever</span>
              Demolir Estufa
            </button>
          </div>

          <div class="tables-subgrid">
            <div v-if="mesasFiltradas.length === 0" style="color: #888; font-style: italic; font-size: 0.9rem;">
              Nenhuma mesa de cultivo instalada nesta estufa.
            </div>
            <div v-else v-for="m in mesasFiltradas" :key="m.id" class="mesa-mini-plate">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="color: var(--accent-terracota);">layers</span>
                <div style="display: flex; flex-direction: column;">
                  <span>{{ m.identificacao }}</span>
                  <small style="font-size: 0.7rem; color: #777; font-weight: normal;">Capacidade: {{ parseFloat(m.capacidade_maxima) }}</small>
                </div>
              </div>
              <button @click="excluirMesa(m.id)" class="btn-icon-delete" title="Remover Mesa">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>
    <Footer />
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from '@/components/Footer.vue';
import WeatherWidget from '@/components/WeatherWidget.vue';

const tipoCadastro = ref('estufa');
const estufaSelecionada = ref(null);

const estufas = ref([]);
const mesas = ref([]);

const novaEstufa = ref({
  nome_setor: '',
  tipo_cultivo: '',
  capacidade_maxima: 0.0
});

const novaMesa = ref({
  estufa: '',
  identificacao: '',
  capacidade_maxima: 0.0,
  status_mesa: 'livre',
  observacoes: ''
});

const mesasFiltradas = computed(() => {
  if (!estufaSelecionada.value) return [];
  return mesas.value.filter(m => m.estufa === estufaSelecionada.value.id);
});

const carregarDadosEspaciais = async () => {
  const token = localStorage.getItem('access_token');
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [resEstufas, resMesas] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/estufa/', { headers }),
      fetch('http://127.0.0.1:8000/api/mesa/', { headers })
    ]);

    if (resEstufas.ok) estufas.value = await resEstufas.json();
    if (resMesas.ok) mesas.value = await resMesas.json();

    if (estufas.value.length > 0 && (!estufaSelecionada.value || !estufas.value.find(e => e.id === estufaSelecionada.value.id))) {
      estufaSelecionada.value = estufas.value[0];
    } else if (estufas.value.length === 0) {
      estufaSelecionada.value = null;
    }
  } catch (err) {
    console.error("Erro ao carregar mapeamento tridimensional:", err);
  }
};

const selecionarEstufa = (estufa) => {
  estufaSelecionada.value = estufa;
};

const cadastrarEstufa = async () => {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch('http://127.0.0.1:8000/api/estufa/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(novaEstufa.value)
    });
    if (res.ok) {
      novaEstufa.value = { nome_setor: '', tipo_cultivo: '', capacidade_maxima: 0.0 };
      await carregarDadosEspaciais();
    } else {
      alert("Erro ao construir estufa. Verifique os dados.");
    }
  } catch (err) {
    console.error(err);
  }
};

const cadastrarMesa = async () => {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch('http://127.0.0.1:8000/api/mesa/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(novaMesa.value)
    });
    if (res.ok) {
      novaMesa.value = { estufa: '', identificacao: '', capacidade_maxima: 0.0, status_mesa: 'livre', observacoes: '' };
      await carregarDadosEspaciais();
    } else {
      alert("Erro ao instalar mesa.");
    }
  } catch (err) {
    console.error(err);
  }
};

// --- NOVAS FUNÇÕES DE EXCLUSÃO (CASCATA) ---

const excluirEstufa = async (id) => {
  if (!confirm("ATENÇÃO: Demolir esta estufa apagará TODAS as mesas instaladas e os lotes plantados nela. Esta ação é irreversível. Deseja continuar?")) {
    return;
  }

  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/estufa/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      await carregarDadosEspaciais();
    } else {
      alert("Falha ao excluir a estufa.");
    }
  } catch (err) {
    console.error("Erro ao excluir:", err);
  }
};

const excluirMesa = async (id) => {
  if (!confirm("Deseja remover esta mesa e os lotes que estão nela?")) {
    return;
  }

  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/mesa/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      await carregarDadosEspaciais();
    } else {
      alert("Falha ao remover a mesa.");
    }
  } catch (err) {
    console.error("Erro ao excluir mesa:", err);
  }
};

onMounted(() => {
  carregarDadosEspaciais();
});
</script>

<style scoped>
/* Omissão do restante do CSS que não mudou para não poluir... (layout-control-container, scene-3d-wrapper, etc) */

/* Os estilos que você já tinha continuam iguais, apenas adicionei estes dois para os botões novos: */

.btn-danger-outline {
  background: transparent;
  border: 1px solid #ffcdd2;
  color: #d32f2f;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: 0.2s;
}

.btn-danger-outline:hover {
  background: #ffebee;
}

.mesa-mini-plate {
  background: white;
  border: 1px solid var(--glass-border);
  padding: 10px 18px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Ajustado para dar espaço ao botão de excluir */
  gap: 15px;
  font-weight: 700;
  color: var(--primary-dark);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: 0.2s;
  min-width: 140px;
}

.mesa-mini-plate:hover {
  transform: translateY(-2px);
  border-color: var(--primary-green);
}

.btn-icon-delete {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: 0.2s;
}

.btn-icon-delete:hover {
  color: #d32f2f;
  background: #ffebee;
}

.layout-control-container { display: grid; grid-template-columns: 350px 1fr; gap: 30px; padding: 0 40px 40px; align-items: start; }
.control-panel-card, .canvas-3d-card { background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
.tab-actions { display: flex; gap: 10px; margin: 20px 0; }
.btn-tab { flex: 1; background: rgba(255,255,255,0.5); border: 1px solid var(--glass-border); padding: 10px; border-radius: 10px; cursor: pointer; font-weight: 600; color: #666; transition: 0.3s; }
.btn-tab.active { background: var(--primary-green); color: white; border-color: var(--primary-green); box-shadow: 0 4px 10px rgba(58, 90, 64, 0.2); }
.spatial-form { display: flex; flex-direction: column; gap: 15px; }
.scene-3d-wrapper { height: 380px; width: 100%; background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.4) 100%); border-radius: 16px; display: flex; justify-content: center; align-items: center; overflow: hidden; perspective: 1500px; border: 1px dashed rgba(0,0,0,0.1); }
.isometric-grid { display: grid; grid-template-columns: repeat(auto-fit, 100px); gap: 50px; transform: rotateX(60deg) rotateZ(-45deg); transform-style: preserve-3d; width: 80%; justify-content: center; }
.cube-estufa { width: 100px; height: 100px; position: relative; transform-style: preserve-3d; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; }
.cube-estufa:hover, .cube-estufa.selected { transform: translateZ(20px); }
.cube-face { position: absolute; width: 100px; height: 100px; transition: 0.3s; box-sizing: border-box; }
.face-top { background: rgba(76, 175, 80, 0.7); border: 2px solid rgba(255,255,255,0.8); transform: rotateX(0deg) translateZ(40px); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.cube-estufa.selected .face-top { background: rgba(188, 108, 37, 0.85); border-color: white; }
.face-front { background: rgba(52, 78, 65, 0.9); transform: rotateX(-90deg) translateY(20px) translateZ(20px); height: 40px; }
.face-side { background: rgba(47, 62, 53, 0.95); transform: rotateY(90deg) translateX(20px) translateZ(40px); width: 40px; }
.cube-label { color: white; font-weight: 800; font-size: 0.85rem; transform: rotateZ(45deg); text-shadow: 1px 1px 3px rgba(0,0,0,0.5); white-space: nowrap; }
.tables-subgrid { display: flex; flex-wrap: wrap; gap: 15px; }
</style>
