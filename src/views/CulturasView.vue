<template>
  <Sidebar />
  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Catálogo de Culturas</h1>
        <p>Definição de parâmetros ideais de clima e tempo para cada espécie.</p>
      </div>
      <WeatherWidget />
    </header>

    <section class="registration-container-estoque">
      <div class="action-bar-estoque">
        <div class="search-box-estoque">
          <span class="material-symbols-outlined search-icon">search</span>
          <input type="text" class="search-input" v-model="busca" placeholder="Buscar cultura..." />
        </div>
        <button class="btn-generate" @click="modoCadastro = true">
          <span class="material-symbols-outlined">add</span> Cadastrar Espécie
        </button>
      </div>

      <div class="inventory-split-view">
        <div class="seed-list-container">
          <div v-for="c in culturasFiltradas" :key="c.id" class="mini-card" :class="{ active: culturaSelecionada?.id === c.id }" @click="selecionar(c)">
            <div class="mini-card-header">
              <h4>{{ c.nome_cultura }}</h4>
              <span class="badge badge-good">{{ c.tempo_medio_colheita }} dias</span>
            </div>
            <div class="mini-card-cultura">Temp: {{ c.temperatura_minima }}°C a {{ c.temperatura_maxima }}°C</div>
          </div>
        </div>

        <div class="seed-detail-panel">
          <form v-if="modoCadastro" @submit.prevent="salvarCultura" class="form-grid-layout">
            <div class="detail-header" style="grid-column: 1 / -1;">
              <h2><span class="material-symbols-outlined">science</span> Nova Cultura</h2>
            </div>
            <div class="form-group full-width">
              <label>Nome Científico / Popular</label>
              <input type="text" v-model="form.nome_cultura" required>
            </div>
            <div class="form-group">
              <label>Tempo Médio Colheita (Dias)</label>
              <input type="number" v-model="form.tempo_medio_colheita" required>
            </div>
            <div class="form-group">
              <label>Umidade Ideal (%)</label>
              <input type="number" step="0.1" v-model="form.umidade_ideal" required>
            </div>
            <div class="form-group">
              <label>Temp. Mínima (°C)</label>
              <input type="number" step="0.1" v-model="form.temperatura_minima" required>
            </div>
            <div class="form-group">
              <label>Temp. Máxima (°C)</label>
              <input type="number" step="0.1" v-model="form.temperatura_maxima" required>
            </div>
            <div class="form-group full-width">
              <label>Descrição / Manejo</label>
              <textarea v-model="form.descricao" rows="2"></textarea>
            </div>
            <div class="form-actions-right" style="grid-column: 1 / -1;">
              <button type="button" class="btn-outline" @click="modoCadastro = false">Cancelar</button>
              <button type="submit" class="btn-save">Salvar Espécie</button>
            </div>
          </form>

          <div v-else-if="culturaSelecionada">
            <div class="detail-header">
              <h2>{{ culturaSelecionada.nome_cultura }}</h2>
              <button class="btn-icon-delete" @click="deletar(culturaSelecionada.id)"><span class="material-symbols-outlined" style="color:#d32f2f">delete</span></button>
            </div>
            <div class="detail-grid">
              <div class="detail-item"><label>Ciclo (Dias)</label><span>{{ culturaSelecionada.tempo_medio_colheita }}</span></div>
              <div class="detail-item"><label>Umidade Ideal</label><span>{{ culturaSelecionada.umidade_ideal }}%</span></div>
              <div class="detail-item full-width qty-destaque">
                <label class="qty-label">Janela Térmica de Segurança</label>
                <span class="qty-value" style="color:var(--primary-dark)">{{ culturaSelecionada.temperatura_minima }}°C a {{ culturaSelecionada.temperatura_maxima }}°C</span>
              </div>
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

const culturas = ref([]);
const culturaSelecionada = ref(null);
const modoCadastro = ref(false);
const busca = ref('');

const form = ref({ nome_cultura: '', descricao: '', tempo_medio_colheita: 0, temperatura_minima: 0, temperatura_maxima: 0, umidade_ideal: 0, observacoes: '' });

const culturasFiltradas = computed(() => culturas.value.filter(c => c.nome_cultura.toLowerCase().includes(busca.value.toLowerCase())));

const carregar = async () => {
  const res = await fetch('http://127.0.0.1:8000/api/cultura/', { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } });
  if (res.ok) culturas.value = await res.json();
};

const selecionar = (c) => { culturaSelecionada.value = c; modoCadastro.value = false; };

const salvarCultura = async () => {
  await fetch('http://127.0.0.1:8000/api/cultura/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    body: JSON.stringify(form.value)
  });
  modoCadastro.value = false;
  carregar();
};

const deletar = async (id) => {
  if(!confirm("Excluir esta cultura?")) return;
  await fetch(`http://127.0.0.1:8000/api/cultura/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } });
  culturaSelecionada.value = null;
  carregar();
};

onMounted(carregar);
</script>
