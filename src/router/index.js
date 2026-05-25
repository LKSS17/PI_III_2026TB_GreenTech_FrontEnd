// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import SafrasView from '../views/SafrasView.vue'
import PlantacoesView from '../views/PlantacoesView.vue'
import SensoresView from '../views/SensoresView.vue'
import AlertasView from '../views/AlertasView.vue'
import HistoricoView from '../views/HistoricoView.vue'
import PerfilView from '../views/PerfilView.vue'
import ConfiguracaoView from '../views/ConfiguracaoView.vue'
import IrrigacaoView from "@/views/IrrigacaoView.vue";
import GerenciadorLayoutView from "@/views/GerenciadorLayoutView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',            name: 'home',        component: HomeView },
    { path: '/dashboard',   name: 'dashboard',   component: DashboardView   ,       meta: { requiresAuth: true } },
    { path: '/layout',      name: 'layout',      component: GerenciadorLayoutView,  meta: { requiresAuth: true }},
    { path: '/safras',      name: 'safras',      component: SafrasView      ,       meta: { requiresAuth: true } },
    { path: '/plantacoes',  name: 'plantacoes',  component: PlantacoesView  ,       meta: { requiresAuth: true } },
    { path: '/sensores',    name: 'sensores',    component: SensoresView    ,       meta: { requiresAuth: true } },
    { path: '/irrigacao',    name: 'irrigacao',  component: IrrigacaoView ,         meta: { requiresAuth: true } },
    { path: '/alertas',     name: 'alertas',     component: AlertasView     ,       meta: { requiresAuth: true } },
    { path: '/historico',   name: 'historico',   component: HistoricoView   ,       meta: { requiresAuth: true } },
    { path: '/perfil',      name: 'perfil',      component: PerfilView      ,       meta: { requiresAuth: true } },
    { path: '/configuracoes', name: 'configuracao', component: ConfiguracaoView,    meta: { requiresAuth: true } },
  ]
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('access_token')
  if (to.meta.requiresAuth && !token) return next('/')
  next()
})

export default router
