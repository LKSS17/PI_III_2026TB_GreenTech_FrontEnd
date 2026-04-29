<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <h1>Painel Geral 🌿</h1>
      <p>Gerenciamento e Registro de Lotes de Rastreabilidade.</p>
    </header>

    <section class="registration-container">
      <div class="form-card">
        <div class="form-header">
          <span class="material-symbols-outlined">add_task</span>
          <h2>Registro de Novo Plantio</h2>
        </div>

        <form @submit.prevent="registrarPlantio" class="grid-form">
          <div class="form-group">
            <label>Semente / Cultura</label>
            <select v-model="form.cultura" required>
              <option value="">Selecione a cultura...</option>
              <option value="alface">Alface Americana</option>
              <option value="tomate">Tomate Cereja</option>
              <option value="rucula">Rúcula</option>
            </select>
          </div>

          <div class="form-group">
            <label>Responsável Técnico</label>
            <input type="text" value="Lucas" readonly>
          </div>

          <div class="form-group">
            <label>Estufa</label>
            <div class="input-with-prefix">
              <span>Estufa - </span>
              <input type="number" v-model="form.estufa_id" placeholder="01" required>
            </div>
          </div>

          <div class="form-group">
            <label>Mesa de Cultivo</label>
            <div class="input-with-prefix">
              <span>M-</span>
              <input type="number" v-model="form.mesa_id" placeholder="05" required>
            </div>
          </div>

          <div class="form-group">
            <label>Data e Hora do Plantio</label>
            <input type="datetime-local" v-model="form.data_plantio" required>
          </div>

          <div class="form-group">
            <label>ID do Lote de Semente</label>
            <div class="input-with-prefix">
              <span>LOTE-</span>
              <input type="text" v-model="form.lote_semente" placeholder="XYZ987" required>
            </div>
          </div>

          <div class="form-footer">
            <button type="submit" class="btn-generate">
              <span class="material-symbols-outlined">qr_code_scanner</span>
              Gerar Lote de Rastreabilidade
            </button>
          </div>
        </form>
      </div>
    </section>

    <footer class="dash-footer">
      <img src="@/assets/img/banner_dashboard.png" alt="GreenTech ERP" class="footer-banner">
    </footer>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';

// Estado do formulário
const form = ref({
  cultura: '',
  estufa_id: '',
  mesa_id: '',
  data_plantio: '',
  lote_semente: ''
});

onMounted(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  form.value.data_plantio = now.toISOString().slice(0, 16);
});

// envio para a API
/* const registrarPlantio = async () => {
  const token = localStorage.getItem('access_token');

  try {
    const response = await fetch('http://127.0.0.1:8000/api/lotes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form.value)
    });

    if (response.ok) {
      alert('Plantio registrado com sucesso!');
      form.value.cultura = '';
      form.value.estufa_id = '';
      form.value.mesa_id = '';
      form.value.lote_semente = '';
    } else {
      alert('Erro ao registrar o plantio.');
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro de conexão com o servidor.");
  }
}; */
</script>
