<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="material-symbols-outlined sidebar-icon">potted_plant</span>
      <h2>GreenTech</h2>
    </div>

    <ul class="sidebar-links">
      <!-- Visão Geral -->
      <li class="section-label">
        <div class="menu-separator"></div>
        <span>Visão Geral</span>
      </li>
      <li>
        <router-link to="/dashboard" active-class="active">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="link-text">Painel Geral</span>
        </router-link>
      </li>
      <!-- Gestão Agrícola (fluxo: Safra → Plantação → Sensores) -->
      <li class="section-label">
        <div class="menu-separator"></div>
        <span>Gestão Agrícola</span>
      </li>

      <li>
        <router-link to="/layout" active-class="active">
          <span class="material-symbols-outlined">view_in_ar</span>
          <span class="link-text">Gêmeo Virtual 3D</span>
        </router-link>
      </li>

      <li><router-link to="/culturas" active-class="active"><span class="material-symbols-outlined">science</span><span class="link-text">Catálogo de Culturas</span></router-link></li>
      <li><router-link to="/estoque" active-class="active"><span class="material-symbols-outlined">inventory_2</span><span class="link-text">Estoque / Insumos</span></router-link></li>
      <li><router-link to="/lotes" active-class="active"><span class="material-symbols-outlined">psychiatry</span><span class="link-text">Lotes de Plantio</span></router-link></li>
      <li><router-link to="/colheitas" active-class="active"><span class="material-symbols-outlined">agriculture</span><span class="link-text">Registro de Colheita</span></router-link></li>

      <!-- Monitoramento -->
      <li class="section-label">
        <div class="menu-separator"></div>
        <span>Monitoramento</span>
      </li>
      <li>
        <router-link to="/alertas" active-class="active">
          <span class="material-symbols-outlined">notifications_active</span>
          <span class="link-text">Alertas</span>
          <span v-if="alertasAtivos > 0" class="badge-count">{{ alertasAtivos }}</span>
        </router-link>
      </li>
      <div v-if="isGerente || isAdmin">
        <li>
          <router-link to="/historico" active-class="active">
            <span class="material-symbols-outlined">history</span>
            <span class="link-text">Histórico</span>
          </router-link>
        </li>
      </div>
      <li>
        <router-link to="/sensores" active-class="active">
          <span class="material-symbols-outlined">detector</span>
          <span class="link-text">Sensores</span>
        </router-link>
      </li>
      <li>
        <router-link to="/irrigacao" active-class="active">
          <span class="material-symbols-outlined">water_drop</span>
          <span class="link-text">Irrigação</span>
        </router-link>
      </li>

      <!-- Conta -->
      <li class="section-label">
        <div class="menu-separator"></div>
        <span>Conta</span>
      </li>
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
        <div class="user-avatar">{{ iniciais }}</div>
        <div class="user-detail">
          <h3>{{ nomeUsuario || 'Usuário' }}</h3>
          <span>{{ cargoUsuario || 'GreenTech' }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {carregarUsuarioLogado} from "@/assets/JS/verificarPermissao.js";

const router = useRouter()

const nomeUsuario  = ref('')
const cargoUsuario = ref('')
const alertasAtivos = ref(0) // Buscar via API futuramente
const isGerente = ref(false);
const isAdmin = ref(false);

const iniciais = computed(() => {
  if (!nomeUsuario.value) return 'GT'
  return nomeUsuario.value
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

const buscarUsuario = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return
  try {
    const res = await fetch('http://127.0.0.1:8000/api/funcionarios/me/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return
    const f = await res.json()
    nomeUsuario.value  = f.nome_completo
    cargoUsuario.value = f.cargo_display || f.cargo
  } catch (e) {
    console.error(e)
  }
}

const verificarAcessos = async () => {
  const permissoes = await carregarUsuarioLogado();

  isGerente.value = permissoes.is_gerente;
  isAdmin.value = permissoes.is_admin;
};

const fazerLogout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  router.replace('/')
}

onMounted( () =>
  {
    buscarUsuario();
    verificarAcessos();
  });
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  width: 85px;
  display: flex;
  flex-direction: column;
  background-color: var(--primary-green);
  padding: 25px 15px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow: hidden;
}

.sidebar:hover { width: 260px; }

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-left: 5px;
  flex-shrink: 0;
}
.sidebar-icon { color: var(--accent-terracota); font-size: 2rem; }
.sidebar-header h2 {
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  white-space: nowrap;
  margin-left: 18px;
  opacity: 0;
  transition: opacity 0.3s;
}
.sidebar:hover .sidebar-header h2 { opacity: 1; }

/* Links */
.sidebar-links {
  list-style: none;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}
.sidebar-links::-webkit-scrollbar { display: none; }

/* Section labels */
.section-label {
  position: relative;
  margin: 22px 0 8px;
  height: 16px;
}
.section-label span {
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  padding-left: 12px;
}
.sidebar:hover .section-label span { opacity: 1; }

.menu-separator {
  position: absolute;
  left: 0; top: 50%;
  width: 45px;
  height: 1px;
  background: rgba(255,255,255,0.12);
  transition: opacity 0.3s;
}
.sidebar:hover .menu-separator { opacity: 0; }

/* Nav items */
.sidebar-links li a {
  display: flex;
  align-items: center;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  padding: 10px 10px;
  margin: 3px 0;
  border-radius: 10px;
  transition: all 0.25s ease;
  position: relative;
}
.sidebar-links li a:hover,

.sidebar-links li a.active {
  background-color: var(--accent-terracota);
  color: #fff;
}
.sidebar-links li a span.material-symbols-outlined {
  font-size: 1.5rem;
  min-width: 45px;
  text-align: center;
  flex-shrink: 0;
}
.link-text {
  opacity: 0;
  margin-left: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: opacity 0.3s;
  white-space: nowrap;
}
.sidebar:hover .link-text { opacity: 1; }

/* Badge de contagem (alertas) */
.badge-count {
  position: absolute;
  right: 10px;
  background: #ef5350;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 6px;
  opacity: 0;
  transition: opacity 0.3s;
}
.sidebar:hover .badge-count { opacity: 1; }

/* User account footer */
.user-account {
  margin-top: auto;
  padding: 15px 5px;
  border-top: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 0;
}
.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--accent-terracota);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}
.user-detail {
  margin-left: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  white-space: nowrap;
}
.sidebar:hover .user-detail { opacity: 1; }
.user-detail h3 { color: #fff; font-size: 0.9rem; font-weight: 600; }
.user-detail span { color: rgba(255,255,255,0.55); font-size: 0.78rem; }
</style>
