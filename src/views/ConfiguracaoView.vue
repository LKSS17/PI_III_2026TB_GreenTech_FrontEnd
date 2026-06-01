<template>
  <Sidebar />

  <main class="main-content">
    <DashHeader
      title="Configurações"
      subtitle="Preferências do sistema, notificações e parâmetros operacionais."
    />

    <section class="config-layout">
      <nav class="config-nav">
        <button v-for="aba in abas" :key="aba.id" class="config-nav-item" :class="{ active: abaAtiva === aba.id }" @click="abaAtiva = aba.id">
          <span class="material-symbols-outlined">{{ aba.icon }}</span><span>{{ aba.label }}</span>
        </button>
      </nav>

      <div class="config-content">

        <div v-show="abaAtiva === 'notificacoes'" class="config-section active">
          <h3 class="config-section-title"><span class="material-symbols-outlined">notifications</span> Preferências de Notificação</h3>
          <p class="config-descricao">Gerencie quais alertas você deseja receber no painel.</p>
          <div class="config-group">
            <div class="config-row">
              <div class="config-row-info"><strong>Alertas de Temperatura</strong><p>Avisos para limites excedidos nas estufas.</p></div>
              <ToggleSwitch v-model="config.notifTemp" />
            </div>
            <div class="config-row">
              <div class="config-row-info"><strong>Alertas de Umidade</strong><p>Avisos para variação de umidade no solo.</p></div>
              <ToggleSwitch v-model="config.notifUmid" />
            </div>
          </div>
        </div>

        <div v-show="abaAtiva === 'sistema'" class="config-section active">
          <h3 class="config-section-title"><span class="material-symbols-outlined">tune</span> Configurações do Sistema</h3>
          <p class="config-descricao">Ajustes visuais e comportamento geral da aplicação.</p>
          <div class="config-group">
            <div class="config-row">
              <div class="config-row-info">
                <strong>Modo Escuro (Dark Mode)</strong>
                <p>Altera o tema visual do sistema (em desenvolvimento).</p>
              </div>
              <ToggleSwitch disabled v-model="config.darkMode" />
            </div>
          </div>
        </div>

        <div v-show="abaAtiva === 'dados'" class="config-section active">
          <h3 class="config-section-title"><span class="material-symbols-outlined">database</span> Dados e Backup</h3>
          <p class="config-descricao">Gerencie os dados armazenados na plataforma.</p>
          <div class="config-group">
            <div class="dados-acoes">
              <ActionCard
                icon="download"
                title="Exportar Lotes (CSV)"
                description="Baixe uma cópia de todos os lotes registrados."
              >
                <template #button>
                  <button class="btn-outline">Exportar</button>
                </template>
              </ActionCard>
            </div>
          </div>
        </div>

        <div v-show="abaAtiva === 'sobre'" class="config-section active">
          <h3 class="config-section-title"><span class="material-symbols-outlined">info</span> Sobre o Sistema</h3>
          <div class="sobre-content">
            <div class="sobre-logo">
              <h2 style="color: var(--primary-green); font-family: 'Poppins', sans-serif;">GreenTech OS</h2>
              <p>Sistema Inteligente de Gestão Agrícola</p>
            </div>
            <div class="sobre-grid">
              <div class="sobre-item" v-for="(info, index) in infosSistema" :key="index">
                <label>{{ info.label }}</label>
                <span>{{ info.value }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <Footer />
  </main>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import DashHeader from "@/components/DashHeader.vue";
import ToggleSwitch from "@/components/ToggleSwitch.vue";
import ActionCard from "@/components/ActionCard.vue";

const abaAtiva = ref('notificacoes');

// Estrutura de dados para o menu lateral, evitando repetição de HTML
const abas = [
  { id: 'notificacoes', icon: 'notifications', label: 'Notificações' },
  { id: 'sistema', icon: 'tune', label: 'Sistema' },
  { id: 'dados', icon: 'database', label: 'Dados e Backup' },
  { id: 'sobre', icon: 'info', label: 'Sobre o Sistema' }
];

// Estrutura de dados para a aba "Sobre", mantendo o template limpo
const infosSistema = [
  { label: 'Versão da Aplicação', value: '0.1.0 (Alpha)' },
  { label: 'Stack Frontend', value: 'Vue.js' },
  { label: 'Licença de Uso', value: 'Projeto Acadêmico (FHO)' },
  { label: 'Suporte Técnico', value: 'felipe.suporte@greentech.dev' }
];

const config = ref({
  notifTemp: true,
  notifUmid: true,
  darkMode: false
});
</script>

<style scoped>
/* --- ESTILOS EXCLUSIVOS DA TELA DE CONFIGURAÇÃO --- */
.config-layout { display: grid; grid-template-columns: 250px 1fr; gap: 30px; padding: 0 40px 40px; align-items: start; }

/* Menu de Navegação */
.config-nav { display: flex; flex-direction: column; gap: 8px; }
.config-nav-item { background: transparent; border: none; padding: 12px 20px; border-radius: 12px; text-align: left; font-size: 0.95rem; font-weight: 600; color: #666; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
.config-nav-item:hover { background: rgba(255,255,255,0.5); }
.config-nav-item.active { background: var(--primary-green); color: white; box-shadow: 0 4px 15px rgba(58,90,64,0.2); }

/* Layout das Abas */
.config-content { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 30px; min-height: 500px; }
.config-section { animation: fadeIn 0.3s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.config-section-title { font-size: 1.4rem; font-weight: 700; color: var(--primary-dark); display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 15px; border-bottom: 1px solid rgba(0,0,0,0.05); }
.config-descricao { color: #666; margin-bottom: 25px; font-size: 0.95rem; }

/* Linhas de Configuração (Notificações/Sistema) */
.config-group { display: flex; flex-direction: column; gap: 15px; }
.config-row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.4); padding: 15px 20px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.03); }
.config-row-info strong { display: block; color: var(--primary-dark); font-size: 1rem; margin-bottom: 4px; }
.config-row-info p { margin: 0; color: #777; font-size: 0.85rem; }

/* Ações de Dados */
.dados-acoes { display: grid; grid-template-columns: 1fr; gap: 15px; }

/* Aba Sobre */
.sobre-content { text-align: center; padding: 20px; }
.sobre-logo { margin-bottom: 30px; }
.sobre-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; background: rgba(255,255,255,0.5); padding: 25px; border-radius: 12px; }
.sobre-item label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
.sobre-item span { font-weight: 600; color: var(--primary-dark); }

/* Responsividade */
@media (max-width: 992px) {
  .config-layout { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .sobre-grid { grid-template-columns: 1fr; }
}
</style>
