<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Gestão de Safras </h1>
        <p>Planejamento e acompanhamento dos ciclos de produção agrícola.</p>
      </div>
      <WeatherWidget />
    </header>

    <section class="registration-container-estoque">
      <div class="action-bar-estoque">
        <div class="search-box-estoque">
          <span class="material-symbols-outlined search-icon">search</span>
          <input type="text" class="search-input" placeholder="Buscar safra..." />
        </div>
        <button class="btn-generate" @click="modoCadastro = true">
          <span class="material-symbols-outlined">add</span>
          Nova Safra
        </button>
      </div>

      <div class="inventory-split-view">
        <div class="seed-list-container">
          <div v-if="safras.length === 0" class="empty-state">Nenhuma safra cadastrada.</div>
          <div
            v-else
            v-for="safra in safras"
            :key="safra.id"
            class="mini-card"
            :class="{ active: safraSelecionada?.id === safra.id }"
            @click="selecionarSafra(safra)"
          >
            <div class="mini-card-header">
              <h4>{{ safra.nome }}</h4>
              <span class="badge" :class="getBadgeClass(safra.status)">{{ safra.status }}</span>
            </div>
            <div class="mini-card-cultura">{{ safra.data_inicio }} até {{ safra.data_fim || 'Atual' }}</div>
          </div>
        </div>

        <div class="seed-detail-panel">

          <div v-if="modoCadastro">
            <div class="detail-header">
              <h2><span class="material-symbols-outlined">add_circle</span> Cadastrar Safra</h2>
            </div>
            <form @submit.prevent="salvarSafra">
              <div class="form-grid-layout">
                <div class="form-group full-width">
                  <label>Nome da Safra</label>
                  <input type="text" v-model="novaSafra.nome" placeholder="Ex: Safra de Inverno 2026" required>
                </div>
                <div class="form-group">
                  <label>Data de Início</label>
                  <input type="date" v-model="novaSafra.data_inicio" required>
                </div>
                <div class="form-group">
                  <label>Data de Fim (Previsão)</label>
                  <input type="date" v-model="novaSafra.data_fim">
                </div>
                <div class="form-group">
                  <label>Status</label>
                  <select v-model="novaSafra.status" required>
                    <option value="Planejada">Planejada</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                </div>
              </div>
              <div class="form-actions-right">
                <button type="button" class="btn-outline" @click="modoCadastro = false">Cancelar</button>
                <button type="submit" class="btn-save">Registrar Safra</button>
              </div>
            </form>
          </div>

          <div v-else-if="safraSelecionada">
            <div class="detail-header">
              <h2>{{ safraSelecionada.nome }}</h2>
              <span class="badge badge-detail" :class="getBadgeClass(safraSelecionada.status)">{{ safraSelecionada.status }}</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Data de Início</label>
                <span>{{ safraSelecionada.data_inicio }}</span>
              </div>
              <div class="detail-item">
                <label>Data de Término</label>
                <span>{{ safraSelecionada.data_fim || 'Não definida' }}</span>
              </div>
            </div>
          </div>

          <div v-else class="detalhe-placeholder" style="text-align: center; color: #aaa; margin-top: 100px;">
            <span class="material-symbols-outlined" style="font-size: 3rem;">grass</span>
            <p>Selecione uma safra para ver os detalhes</p>
          </div>

        </div>
      </div>
    </section>
    <Footer/>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";

const safras = ref([]);
const safraSelecionada = ref(null);
const modoCadastro = ref(false);

const novaSafra = ref({ nome: '', data_inicio: '', data_fim: '', status: 'Planejada' });

const carregarSafras = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const res = await fetch('http://127.0.0.1:8000/api/safras/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      safras.value = await res.json();
    }
  } catch (error) {
    console.error("Erro ao buscar safras:", error);
  }
};

const selecionarSafra = (safra) => {
  safraSelecionada.value = safra;
  modoCadastro.value = false;
};

const salvarSafra = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const res = await fetch('http://127.0.0.1:8000/api/safras/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(novaSafra.value)
    });
    if (res.ok) {
      alert("Safra registrada com sucesso!");
      modoCadastro.value = false;
      carregarSafras();
    }
  } catch (error) {
    console.error(error);
  }
};

const getBadgeClass = (status) => {
  if (status === 'Em Andamento') return 'badge-good';
  if (status === 'Finalizada') return 'badge-out';
  return 'badge-low';
};

onMounted(() => carregarSafras());
</script>
