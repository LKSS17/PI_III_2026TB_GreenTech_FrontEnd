<script setup>
import Footer from "@/components/Footer.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";
import Sidebar from "@/components/Sidebar.vue";

</script>
<template>
  <Sidebar />

  <main class="main-content">

    <header class="dash-header">
      <div class="header-titles">
        <h1>Estufas e Mesas 🌿</h1>
        <p>Gestão espacial — visualização do desenvolvimento dos tubetes por mesa.</p>
      </div>
      <WeatherWidget/>
    </header>

    <div class="estufa-selector-bar">
      <button
        v-for="estufa in estufasData"
        :key="estufa.id"
        class="estufa-tab"
        :class="{ active: estufaSelecionadaId === estufa.id }"
        @click="selecionarEstufa(estufa.id)"
      >
        {{ estufa.nome }}
      </button>
    </div>

    <section class="estufas-split-view">
      <div class="mapa-container">
      </div>

      <div class="mesa-detalhe-panel">
        <div v-if="!mesaSelecionada" class="detalhe-placeholder">
          <span class="material-symbols-outlined icon-big">touch_app</span>
          <p>Selecione uma mesa no mapa para ver o desenvolvimento dos tubetes</p>
        </div>

        <div v-else class="detalhe-content">
          <div class="detalhe-header">
            <h2>Mesa {{ mesaSelecionada.id }}</h2>
            <span class="badge" :class="'badge-' + mesaSelecionada.status">
              {{ mesaSelecionada.status === 'livre' ? 'Livre' : (mesaSelecionada.status === 'cultivo' ? 'Em Desenvolvimento' : 'Pronta p/ Colheita') }}
            </span>
          </div>

          <div class="detalhe-infos">
            <div class="info-group">
              <label>Tubetes (Cultura)</label>
              <strong>{{ mesaSelecionada.cultura }}</strong>
            </div>
            <div class="info-group">
              <label>Data de Alocação</label>
              <span>{{ mesaSelecionada.plantio }}</span>
            </div>
            <div class="info-group">
              <label>Previsão de Colheita</label>
              <span>{{ mesaSelecionada.colheita }}</span>
            </div>
          </div>

          <div class="detalhe-actions">
            <button v-if="mesaSelecionada.status === 'livre'" class="btn-save full-width">
              <span class="material-symbols-outlined">local_florist</span> Alocar Tubetes Aqui
            </button>
            <button v-else-if="mesaSelecionada.status === 'colheita'" class="btn-save full-width" style="background: var(--accent-terracota);">
              <span class="material-symbols-outlined">agriculture</span> Registrar Colheita
            </button>
            <button v-else class="btn-outline full-width">
              <span class="material-symbols-outlined">edit</span> Atualizar Status
            </button>
          </div>
        </div>
      </div>
    </section>

    <Footer/>
  </main>
</template>

<style scoped>

/* BARRA DE ABAS (TABS) */
.estufa-selector-bar {
  display: flex;
  gap: 10px;
  padding: 0 40px;
  margin-bottom: 20px;
}

.estufa-tab {
  background: transparent;
  border: 2px solid var(--gray-light);
  color: var(--text-light);
  padding: 10px 25px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.estufa-tab:hover {
  background: rgba(58, 90, 64, 0.05);
  border-color: var(--primary-green);
  color: var(--primary-green);
}

.estufa-tab.active {
  background: var(--primary-green);
  border-color: var(--primary-green);
  color: var(--white);
  box-shadow: 0 4px 12px rgba(58, 90, 64, 0.2);
}

/* SPLIT VIEW (MAPA X DETALHES) */
.estufas-split-view {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  padding: 0 40px 40px 40px;
  max-width: 1400px;
  align-items: start;
}

/* LADO ESQUERDO: MAPA */
.mapa-container {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  min-height: 225px;
}

.mapa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(0,0,0,0.05);
  padding-bottom: 15px;
  margin-bottom: 25px;
}

.mapa-header h3 {
  color: var(--primary-dark);
  font-family: 'Poppins', sans-serif;
}

.mapa-legenda {
  display: flex;
  gap: 15px;
}

.legenda-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.dot.livre { background-color: #e0e0e0; border: 2px solid #bdbdbd; }
.dot.cultivo { background-color: rgba(76, 175, 80, 0.2); border: 2px solid #4CAF50; }
.dot.colheita { background-color: rgba(188, 108, 37, 0.2); border: 2px solid var(--accent-terracota); }

/* GRID DE MESAS */
.mapa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}

.mesa-box {
  height: 100px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.mesa-box:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.mesa-box.mesa-active {
  border-color: var(--primary-dark);
  box-shadow: 0 0 0 3px rgba(52, 78, 65, 0.2);
}

.mesa-id { font-weight: 800; font-size: 1.2rem; }
.mesa-cultura { font-size: 0.8rem; font-weight: 600; text-align: center; margin-top: 5px; }

/* Status das Mesas */
.livre { background-color: #f5f5f5; border-color: #e0e0e0; color: #757575; }
.cultivo { background-color: rgba(76, 175, 80, 0.1); border-color: #4CAF50; color: #2e7d32; }
.colheita { background-color: rgba(188, 108, 37, 0.1); border-color: var(--accent-terracota); color: #8d4e16; }

.no-mesas {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--text-light);
  font-style: italic;
}

/* LADO DIREITO: PAINEL DE DETALHES */
.mesa-detalhe-panel {
  background: var(--white);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  min-height: 455px;
  display: flex;
  flex-direction: column;
}

.detalhe-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #aaa;
  text-align: center;
  gap: 15px;
  margin-top: 50px;
}

.icon-big {
  font-size: 4rem;
  color: #ccc;
}

.detalhe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(0,0,0,0.05);
}

.detalhe-header h2 {
  color: var(--primary-green);
  font-family: 'Poppins', sans-serif;
}

.detalhe-infos {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
}

.info-group {
  background: var(--bg-creme);
  padding: 15px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.info-group label {
  font-size: 0.8rem;
  color: var(--text-light);
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 5px;
}

.info-group strong { color: var(--primary-dark); font-size: 1.2rem; }
.info-group span { color: #555; font-weight: 600; }

.detalhe-actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.full-width {
  width: 100%;
  justify-content: center;
}

.badge-livre { background: #e0e0e0; color: #616161; }
.badge-cultivo { background: rgba(76, 175, 80, 0.2); color: #2e7d32; }
.badge-colheita { background: rgba(188, 108, 37, 0.2); color: #8d4e16; }

@media (max-width: 1024px) {
  .estufas-split-view { grid-template-columns: 1fr; }
  .mesa-detalhe-panel { min-height: auto; }
}
</style>
