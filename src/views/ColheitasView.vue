<template>
  <Sidebar />
  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Registro de Colheita</h1>
        <p>Baixa de lotes, registro de produtividade e análise de perdas (Scrap).</p>
      </div>
      <WeatherWidget />
    </header>

    <section class="registration-container" style="align-items: flex-start;">
      <div class="form-card" style="width: 100%; max-width: 800px;">
        <h3 style="color: var(--primary-green); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined">agriculture</span> Efetuar Colheita
        </h3>

        <form @submit.prevent="salvarColheita" class="spatial-form">
          <div class="form-group">
            <label>Lote de Origem (Para Baixa)</label>
            <select v-model="form.lote" required>
              <option value="" disabled>Selecione um lote em desenvolvimento...</option>
              <option v-for="l in lotesAtivos" :key="l.id" :value="l.id">LOTE #{{ l.id }} - Mesa {{ l.mesa_id }}</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label>Produtividade (Qtd Colhida)</label>
              <input type="number" step="0.01" v-model="form.quantidade_colhida" required />
            </div>
            <div class="form-group">
              <label>Scrap (Qtd Perdida)</label>
              <input type="number" step="0.01" v-model="form.quantidade_perda" required />
            </div>
          </div>

          <div class="form-group" v-if="form.quantidade_perda > 0">
            <label>Motivo da Perda</label>
            <select v-model="form.motivo_perda" required>
              <option value="Pragas">Pragas / Doenças</option>
              <option value="Clima">Estresse Climático</option>
              <option value="Operacional">Falha Operacional</option>
              <option value="Qualidade">Baixa Qualidade Padrão</option>
            </select>
          </div>

          <div class="form-group">
            <label>Observações Adicionais</label>
            <textarea v-model="form.observacoes" rows="2" placeholder="Avaliação visual do lote..."></textarea>
          </div>

          <button type="submit" class="btn-generate full-width" style="margin-top: 15px;">
            Registrar e Finalizar Lote
          </button>
        </form>
      </div>
    </section>
    <Footer />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from '@/components/Footer.vue';
import WeatherWidget from '@/components/WeatherWidget.vue';

const lotesAtivos = ref([]);
const form = ref({ lote: '', quantidade_colhida: 0, quantidade_perda: 0, motivo_perda: '', observacoes: '' });

const carregarLotes = async () => {
  const res = await fetch('http://127.0.0.1:8000/api/lotePlantio/', { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } });
  if (res.ok) {
    const todos = await res.json();
    lotesAtivos.value = todos.filter(l => l.status !== 'Colhido'); // Traz só o que ainda não foi colhido
  }
};

const salvarColheita = async () => {
  const token = localStorage.getItem('access_token');
  const payload = {
    ...form.value,
    data_colheita: new Date().toISOString().split('T')[0] // Manda a data atual
  };

  try {
    const res = await fetch('http://127.0.0.1:8000/api/colheita/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Colheita registrada com sucesso! O lote foi atualizado.");
      form.value = { lote: '', quantidade_colhida: 0, quantidade_perda: 0, motivo_perda: '', observacoes: '' };
      carregarLotes();
    } else {
      alert("Erro ao salvar o registro.");
    }
  } catch (err) {
    console.error(err);
  }
};

onMounted(carregarLotes);
</script>
