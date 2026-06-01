// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import SensoresView from '../views/SensoresView.vue'
import AlertasView from '../views/AlertasView.vue'
import HistoricoView from '../views/HistoricoView.vue'
import PerfilView from '../views/PerfilView.vue'
import ConfiguracaoView from '../views/ConfiguracaoView.vue'
import IrrigacaoView from "@/views/IrrigacaoView.vue";
import GerenciadorLayoutView from "@/views/GerenciadorLayoutView.vue";
import CulturasView from "@/views/CulturasView.vue";
import ColheitasView from "@/views/ColheitasView.vue";
import LotePlantioView from "@/views/LotePlantioView.vue";
import EstoqueView from "@/views/EstoqueView.vue";

import { carregarUsuarioLogado } from '@/assets/JS/verificarPermissao.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',            name: 'home',        component: HomeView },
    { path: '/dashboard',   name: 'dashboard',   component: DashboardView   ,       meta: { requiresAuth: true } },
    { path: '/layout',      name: 'layout',      component: GerenciadorLayoutView,  meta: { requiresAuth: true }},
    { path: '/culturas',    name: 'culturas',    component: CulturasView      ,     meta: { requiresAuth: true } },
    { path: '/colheitas',   name: 'colheitas',   component: ColheitasView  ,        meta: { requiresAuth: true } },
    { path: '/lotes',       name: 'lotes',       component: LotePlantioView ,       meta: { requiresAuth: true } },
    { path: '/estoque',     name: 'estoque',     component: EstoqueView     ,       meta: { requiresAuth: true } },
    { path: '/sensores',    name: 'sensores',    component: SensoresView    ,       meta: { requiresAuth: true } },
    { path: '/irrigacao',    name: 'irrigacao',  component: IrrigacaoView ,         meta: { requiresAuth: true } },
    { path: '/alertas',     name: 'alertas',     component: AlertasView     ,       meta: { requiresAuth: true } },
    { path: '/historico',   name: 'historico',   component: HistoricoView   ,       meta: { requiresAuth: true } },
    { path: '/perfil',      name: 'perfil',      component: PerfilView      ,       meta: { requiresAuth: true } },
    { path: '/configuracoes', name: 'configuracao', component: ConfiguracaoView,    meta: { requiresAuth: true } },
    {
      path: '/historico',
      name: 'historico',
      component: HistoricoView,
      meta: { requiresAuth: true, requiresAuditor: true }
    },
  ]
})

router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('access_token')

  if (to.meta.requiresAuth && !token) {
    return next('/')
  }

  if (to.meta.requiresAuditor) {
    const permissoes = await carregarUsuarioLogado()

    if (!permissoes.is_gerente && !permissoes.is_admin) {
      alert("Acesso Negado: Apenas Gerentes e Administradores podem acessar a Auditoria do sistema.")
      return next('/dashboard')
    }
  }

  next()
})

export default router
