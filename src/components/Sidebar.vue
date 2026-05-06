<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="material-symbols-outlined sidebar-icon">potted_plant</span>
      <h2>GreenTech</h2>
    </div>

    <ul class="sidebar-links">
      <h4>
        <div class="menu-separator"></div>
        <span>Monitoramento</span>
      </h4>
      <li>
        <router-link to="/dashboard" active-class="active">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="link-text">Painel Geral</span>
        </router-link>
      </li>
      <li>
        <router-link to="/sensores" active-class="active">
          <span class="material-symbols-outlined">thermostat</span>
          <span class="link-text">Sensores IoT</span>
        </router-link>
      </li>
      <li>
        <router-link to="/irrigacao" active-class="active">
          <span class="material-symbols-outlined">water_drop</span>
          <span class="link-text">Irrigação</span>
        </router-link>
      </li>

      <h4>
        <div class="menu-separator"></div>
        <span>Rastreabilidade</span>
      </h4>
      <li>
        <router-link to="/estoque" active-class="active">
          <span class="material-symbols-outlined">inventory_2</span>
          <span class="link-text">Estoque Sementes</span>
        </router-link>
      </li>
      <li>
        <router-link to="/estufas" active-class="active">
          <span class="material-symbols-outlined">agriculture</span>
          <span class="link-text">Estufas e Mesas</span>
        </router-link>
      </li>
      <li>
        <router-link to="/lotes" active-class="active">
          <span class="material-symbols-outlined">qr_code_2</span>
          <span class="link-text">Lotes e IDs</span>
        </router-link>
      </li>

      <h4>
        <div class="menu-separator"></div>
        <span>Conta</span>
      </h4>
      <li>
        <router-link to="/perfil" active-class="active">
          <span class="material-symbols-outlined">account_circle</span>
          <span class="link-text">Meu Perfil</span>
        </router-link>
      </li>
      <li>
        <router-link to="/configuracoes" active-class="active">
          <span class="material-symbols-outlined">settings</span>
          <span class="link-text">Configurações</span>
        </router-link>
      </li>
      <li>
        <a href="#" @click.prevent="fazerLogout">
          <span class="material-symbols-outlined">logout</span>
          <span class="link-text">Sair</span>
        </a>
      </li>
    </ul>

    <div class="user-account">
      <div class="user-profile">
        <img src="@/assets/img/Greentech_fundo.png" alt="Perfil" />
        <div class="user-detail">
          <h3>{{ nomeUsuario || 'Usuário' }}</h3>
          <span>{{ cargoUsuario || 'GreenTech' }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* --- SIDEBAR --- */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 85px;
  display: flex;
  flex-direction: column;
  background-color: var(--primary-green);
  padding: 25px 15px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow: hidden;
}

.sidebar:hover {
  width: 260px;
}

.sidebar .sidebar-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-left: 5px;
}

.sidebar-icon {
  color: #bc6c25;
  font-size: 2rem;
}

.sidebar .sidebar-header h2 {
  color: var(--white);
  font-family: "Poppins", sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  white-space: nowrap;
  margin-left: 20px;
  opacity: 0;
  transition: opacity 0.3s;
}

.sidebar:hover .sidebar-header h2 {
  opacity: 1;
}

.sidebar-links {
  list-style: none;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}

.sidebar-links::-webkit-scrollbar {
  display: none;
}

.sidebar-links h4 {
  color: var(--text-light);
  text-transform: uppercase;
  font-size: 0.75rem;
  margin: 25px 0 10px;
  position: relative;
  white-space: nowrap;
}

.sidebar-links h4 span {
  opacity: 0;
  margin-left: 10px;
  transition: opacity 0.3s;
}

.sidebar:hover .sidebar-links h4 span {
  opacity: 1;
}

.sidebar-links .menu-separator {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar:hover .sidebar-links .menu-separator {
  display: none;
}

.sidebar-links li a {
  display: flex;
  align-items: center;
  color: var(--white);
  text-decoration: none;
  padding: 12px 10px;
  margin: 5px 0;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.sidebar-links li a.active,
.sidebar-links li a:hover {
  background-color: var(--accent-terracota);
}

.sidebar-links li a span.material-symbols-outlined {
  font-size: 1.6rem;
  min-width: 45px;
  text-align: center;
}

.sidebar-links li a .link-text {
  opacity: 0;
  margin-left: 10px;
  font-weight: 500;
  transition: opacity 0.3s;
  white-space: nowrap;
}

.sidebar:hover .sidebar-links li a .link-text {
  opacity: 1;
}

.user-account {
  margin-top: auto;
  padding: 15px 5px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
}

.user-profile img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid var(--accent-terracota);
  object-fit: cover;
}

.user-detail {
  margin-left: 15px;
  opacity: 0;
  transition: opacity 0.3s;
  white-space: nowrap;
}

.sidebar:hover .user-detail {
  opacity: 1;
}

.user-detail h3 {
  color: var(--white);
  font-size: 0.95rem;
}

</style>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const nomeUsuario = ref('');
const cargoUsuario = ref('');

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

    nomeUsuario.value = funcionario.nome_completo;
    cargoUsuario.value = funcionario.cargo_display;
  } catch (error) {
    console.error(error);
  }
};

const fazerLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  router.replace('/');
};

onMounted(() => {
  buscarUsuario();
});
</script>
