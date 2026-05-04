<script setup>
import {onMounted, ref} from 'vue';
import Sidebar from "@/components/Sidebar.vue";

import imgBanner from '@/assets/img/Greentech_fundo.png';

// Referência para o input de arquivo (substitui o document.getElementById)
const uploadFotoRef = ref(null);

// Estado reativo para a foto de perfil
const avatarSrc = ref(imgBanner);

const nomeCompleto = ref('');
const nomeUsuario = ref('');
const cargoUsuario = ref('');
const emailUsuario = ref('');
const telefoneUsuario = ref('');

// Funções
const triggerUpload = () => {
  uploadFotoRef.value.click();
};

const previewFoto = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatarSrc.value = URL.createObjectURL(file);
  }
};

const salvarPerfil = () => {
  // Aqui vai a lógica de integração via fetch/axios com o Django REST
  console.log("Dados do perfil salvos com sucesso!");
};

const alterarSenha = () => {
  // Lógica de validação e update de senha
  console.log("Solicitação de alteração de senha enviada.");
};

const buscarUsuario = async () => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/funcionarios/me/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return;
    }

    const funcionario = await response.json();

    nomeCompleto.value = funcionario.nome_completo
    nomeUsuario.value = funcionario.username;
    cargoUsuario.value = funcionario.cargo_display;
    emailUsuario.value = funcionario.email;
    telefoneUsuario.value = funcionario.telefone;
    cargoUsuario.value = funcionario.cargo;

  } catch (error) {
    console.error(error);
  }
};

onMounted(buscarUsuario)
</script>

<template>
  <Sidebar/>

  <main class="main-content">
    <header class="dash-header">
      <h1>Meu Perfil 👤</h1>
      <p>Gerencie suas informações pessoais e credenciais de acesso.</p>
    </header>

    <section class="perfil-layout">
      <!-- Card da Esquerda: Avatar e Stats -->
      <div class="perfil-hero-card">
        <div class="perfil-avatar-wrapper">
          <img :src="avatarSrc" alt="Avatar" class="perfil-avatar" />
          <button class="perfil-avatar-edit" @click="triggerUpload" title="Alterar foto">
            <span class="material-symbols-outlined">photo_camera</span>
          </button>
          <input
            type="file"
            ref="uploadFotoRef"
            accept="image/*"
            style="display:none"
            @change="previewFoto"
          />
        </div>

        <h2 class="perfil-nome"> {{nomeUsuario || 'Carregando...'}} </h2>

        <span class="perfil-role-badge">
          <span class="material-symbols-outlined" style="font-size:0.9rem">verified</span>
          {{ cargoUsuario || "Carregando..." }}
        </span>

        <div class="perfil-stats">
          <div class="stat-item">
            <div class="stat-value">5</div>
            <div class="stat-label">Lotes registrados</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">3</div>
            <div class="stat-label">Estufas gerenciadas</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">42d</div>
            <div class="stat-label">No sistema</div>
          </div>
        </div>
      </div>

      <!-- Card da Direita: Formulários -->
      <div class="perfil-form-card">
        <div class="perfil-section-title">
          <span class="material-symbols-outlined">person</span> Dados Pessoais
        </div>

        <form id="form-perfil" class="perfil-form-grid" @submit.prevent="salvarPerfil">
          <div class="form-group">
            <label>Nome Completo</label>
            <input type="text" id="pf-nome" v-model="nomeCompleto" />
          </div>
          <div class="form-group">
            <label>Nome de Usuário</label>
            <input type="text" v-model="nomeUsuario" />
          </div>
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" id="pf-email" v-model="emailUsuario" />
          </div>
          <div class="form-group">
            <label>Telefone</label>
            <input type="tel" id="pf-tel" v-model="telefoneUsuario" />
          </div>

          <div class="perfil-form-actions">
            <button type="reset" class="btn-outline">Cancelar</button>
            <button type="submit" class="btn-save">
              <span class="material-symbols-outlined">save</span> Salvar Alterações
            </button>
          </div>
        </form>

        <div class="perfil-section-title sec-seguranca">
          <span class="material-symbols-outlined">lock</span> Segurança
        </div>

        <form id="form-senha" class="perfil-form-grid" @submit.prevent="alterarSenha">
          <div class="form-group">
            <label>Senha Atual</label>
            <input type="password" id="pf-senha-atual" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label>Nova Senha</label>
            <input type="password" id="pf-nova-senha" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label>Confirmar Nova Senha</label>
            <input type="password" id="pf-confirmar-senha" placeholder="••••••••" />
          </div>
          <div class="perfil-form-actions perfil-full-row">
            <button type="submit" class="btn-save">
              <span class="material-symbols-outlined">lock_reset</span> Alterar Senha
            </button>
          </div>
        </form>
      </div>
    </section>

    <footer class="dash-footer">
      <img src="../assets/img/banner_dashboard.png" alt="GreenTech ERP" class="footer-banner" />
    </footer>
  </main>
</template>

<style scoped>

.dash-header h1 {
  color: var(--primary, #3a5a40);
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.dash-header p {
  color: #555;
  font-size: 1rem;
}

/* Layout Grid Principal */
.perfil-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-top: 2rem;
}

/* Estilos de Cards (Reutilizáveis) */
.perfil-hero-card,
.perfil-form-card {
  background: var(--white, #ffffff);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

/* --- Card da Esquerda (Hero) --- */
.perfil-hero-card {
  text-align: center;
  height: fit-content;
}

.perfil-avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.perfil-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--gray-light, #dad7cd);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.perfil-avatar-edit {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: var(--accent, #bc6c25);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(188, 108, 37, 0.4);
}

.perfil-avatar-edit:hover {
  background-color: #9c581c;
  transform: scale(1.05);
}

.perfil-nome {
  color: var(--text-main, #283618);
  margin-bottom: 0.3rem;
  font-size: 1.5rem;
}

.perfil-cargo {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.perfil-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(58, 90, 64, 0.1);
  color: var(--primary, #3a5a40);
  padding: 0.5rem 1rem;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
}

.perfil-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  border-top: 1px solid var(--gray-light, #dad7cd);
  padding-top: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--primary, #3a5a40);
}

.stat-label {
  font-size: 0.75rem;
  color: #777;
  margin-top: 0.2rem;
}

/* --- Card da Direita (Formulários) --- */
.perfil-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-main, #283618);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.sec-seguranca {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gray-light, #dad7cd);
}

.perfil-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.perfil-full-row {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--gray-light, #dad7cd);
  border-radius: 8px;
  background-color: #fafafa;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--text-main, #283618);
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--primary, #3a5a40);
  background-color: var(--white, #ffffff);
  outline: none;
  box-shadow: 0 0 0 3px rgba(58, 90, 64, 0.15);
}

.form-group input[readonly] {
  background-color: #f0f0f0;
  color: #888;
  cursor: not-allowed;
  border-color: #e0e0e0;
}

/* --- Botões de Ação --- */
.perfil-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-outline {
  padding: 0.8rem 1.5rem;
  border: 1px solid var(--gray-light, #dad7cd);
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #555;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: var(--gray-light, #dad7cd);
  color: var(--text-main, #283618);
}

.btn-save {
  padding: 0.8rem 1.5rem;
  border: none;
  background: var(--primary, #3a5a40);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: var(--white, #ffffff);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-save:hover {
  background: var(--primary-dark, #344e41);
  transform: translateY(-1px);
}

/* --- Footer --- */
.dash-footer {
  margin-top: 3rem;
  text-align: center;
}

.footer-banner {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.footer-banner:hover {
  opacity: 1;
}

/* --- Responsividade --- */
@media (max-width: 1024px) {
  .perfil-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1.5rem;
  }

  .perfil-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
