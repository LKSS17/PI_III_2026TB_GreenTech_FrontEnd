<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Gêmeo Virtual & Layout 3D</h1>
        <p>Gerenciamento espacial interativo das estufas e alocação de malhas de cultivo.</p>
      </div>
      <WeatherWidget />
    </header>

    <section class="layout-control-container">
      <div class="control-panel-card">
        <h3><span class="material-symbols-outlined">add_box</span> Novo Elemento Espacial</h3>

        <div class="tab-actions">
          <button class="btn-tab" :class="{ active: tipoCadastro === 'estufa' }" @click="tipoCadastro = 'estufa'">Estufa</button>
          <button class="btn-tab" :class="{ active: tipoCadastro === 'mesa' }" @click="tipoCadastro = 'mesa'">Mesa Interna</button>
        </div>

        <form v-if="tipoCadastro === 'estufa'" @submit.prevent="cadastrarEstufa" class="spatial-form">
          <div class="form-group">
            <label>Nome/Identificador da Estufa</label>
            <input type="text" v-model="novaEstufa.nome" placeholder="Ex: Estufa Alfa" required />
          </div>
          <div class="form-group">
            <label>Localização/Bloco</label>
            <input type="text" v-model="novaEstufa.localizacao" placeholder="Ex: Setor Norte" required />
          </div>
          <button type="submit" class="btn-generate full-width">Construir Estufa</button>
        </form>

        <form v-else @submit.prevent="cadastrarMesa" class="spatial-form">
          <div class="form-group">
            <label>Estufa Destino</label>
            <select v-model="novaMesa.estufa_id" required>
              <option value="" disabled>Selecione a estufa...</option>
              <option v-for="e in estufas" :key="e.id" :value="e.id">{{ e.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Código da Mesa</label>
            <input type="text" v-model="novaMesa.codigo" placeholder="Ex: M-10" required />
          </div>
          <button type="submit" class="btn-generate full-width">Instalar Mesa</button>
        </form>
      </div>

      <div class="canvas-3d-card">
        <div class="canvas-header">
          <h3>Projeção Espacial Isométrica</h3>
          <span class="badge badge-good">Ambiente Virtual Ativo</span>
        </div>

        <div class="scene-3d-wrapper">
          <div class="isometric-grid">
            <div
              v-for="estufa in estufas"
              :key="estufa.id"
              class="cube-estufa"
              :class="{ selected: estufaSelecionada?.id === estufa.id }"
              @click="selecionarEstufa(estufa)"
            >
              <div class="cube-face face-top">
                <span class="cube-label">{{ estufa.nome }}</span>
              </div>
              <div class="cube-face face-front"></div>
              <div class="cube-face face-side"></div>
            </div>
          </div>
        </div>

        <div v-if="estufaSelecionada" class="inner-layout-details animate-fade">
          <h4>Estrutura Interna — {{ estufaSelecionada.nome }}</h4>
          <div class="tables-subgrid">
            <div v-for="m in mesasFiltradas" :key="m.id" class="mesa-mini-plate">
              <span class="material-symbols-outlined">layers</span>
              <span>{{ m.codigo }}</span>
            </div>
            <div v-if="mesasFiltradas.length === 0" class="empty-subgrid">
              Nenhuma mesa de cultivo instalada nesta estufa.
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

const novaEstufa = ref({ nome: '', localizacao: '' });
const novaMesa = ref({ estufa_id: '', codigo: '' });

const mesasFiltradas = computed(() => {
  if (!estufaSelecionada.value) return [];
  return mesas.value.filter(m => m.estufa_id === estufaSelecionada.value.id);
});

const carregarDadosEspaciais = async () => {
  const token = localStorage.getItem('access_token');
  try {
    const [resEstufas, resMesas] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/estufas/', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('http://127.0.0.1:8000/api/mesas/', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    if (resEstufas.ok) estufas.value = await resEstufas.json();
    if (resMesas.ok) mesas.value = await resMesas.json();

    if (estufas.value.length > 0 && !estufaSelecionada.value) {
      estufaSelecionada.value = estufas.value[0];
    }
  } catch (err) {
    console.error("Erro ao carregar dados espaciais:", err);
  }
};

const selecionarEstufa = (estufa) => {
  estufaSelecionada.value = estufa;
};

const cadastrarEstufa = async () => {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch('http://127.0.0.1:8000/api/estufas/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(novaEstufa.value)
    });
    if (res.ok) {
      novaEstufa.value = { nome: '', localizacao: '' };
      await carregarDadosEspaciais();
    }
  } catch (err) {
    console.error(err);
  }
};

const cadastrarMesa = async () => {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch('http://127.0.0.1:8000/api/mesas/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(novaMesa.value)
    });
    if (res.ok) {
      novaMesa.value = { estufa_id: '', codigo: '' };
      await carregarDadosEspaciais();
    }
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  carregarDadosEspaciais();
});
</script>

<style scoped>
.layout-control-container {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  padding: 0 40px 40px;
}

.control-panel-card, .canvas-3d-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}

.tab-actions {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.btn-tab {
  flex: 1;
  background: rgba(255,255,255,0.5);
  border: 1px solid var(--glass-border);
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: var(--primary-dark);
  transition: 0.3s;
}

.btn-tab.active {
  background: var(--primary-green);
  color: white;
}

.spatial-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Cenografia Tridimensional Projeção Isométrica */
.scene-3d-wrapper {
  height: 350px;
  width: 100%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  perspective: 1000px;
  margin: 20px 0;
  border: 1px dashed rgba(0,0,0,0.1);
}

.isometric-grid {
  display: grid;
  grid-template-columns: repeat(3, 110px);
  gap: 40px;
  transform: rotateX(60deg) rotateZ(-45deg);
  transform-style: preserve-3d;
}

.cube-estufa {
  width: 100px;
  height: 100px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s;
  cursor: pointer;
}

.cube-estufa:hover, .cube-estufa.selected {
  transform: translateZ(15px);
}

.cube-face {
  position: absolute;
  width: 100px;
  height: 100px;
  transition: 0.3s;
}

.face-top {
  background: rgba(58, 90, 64, 0.75);
  border: 2px solid #fff;
  transform: rotateX(0deg) translateZ(40px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cube-estufa.selected .face-top {
  background: rgba(188, 108, 37, 0.85);
}

.face-front {
  background: rgba(52, 78, 65, 0.85);
  transform: rotateX(-90deg) translateY(20px) translateZ(20px);
  height: 40px;
}

.face-side {
  background: rgba(47, 62, 53, 0.9);
  transform: rotateY(90deg) translateX(20px) translateZ(40px);
  width: 40px;
}

.cube-label {
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  transform: rotateZ(45deg);
  white-space: nowrap;
}

.inner-layout-details h4 {
  font-family: 'Poppins', sans-serif;
  color: var(--primary-green);
  margin-bottom: 15px;
}

.tables-subgrid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.mesa-mini-plate {
  background: white;
  border: 1px solid var(--glass-border);
  padding: 12px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  color: var(--primary-dark);
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}
</style>
