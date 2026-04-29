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
          <h3>Lucas</h3>
          <span>Sistemas de Informação</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const fazerLogout = () => {

  localStorage.removeItem('access_token');

  // localStorage.clear();

  router.replace('/');
};
</script>
