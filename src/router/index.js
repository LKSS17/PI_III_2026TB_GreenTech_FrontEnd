import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import EstoqueView from '../views/EstoqueView.vue'
import PerfilView from "@/views/PerfilView.vue";
import EstufasView from "@/views/EstufasView.vue";
import SensoresView from "@/views/SensoresView.vue";
import '../assets/dashboard-views.css'
import irrigacaoView from "@/views/IrrigacaoView.vue";
import ConfiguracaoView from "@/views/ConfiguracaoView.vue";
import LotesView from "@/views/LotesView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/sensores', name: 'sensores', component:  SensoresView },
    { path: '/irrigacao', name: 'irrigacao', component: irrigacaoView },
    { path: '/estoque', name: 'estoque', component: EstoqueView },
    { path: '/perfil', name: 'perfil', component: PerfilView},
    { path: '/estufas', name: 'estufas', component: EstufasView},
    { path: '/lotes', name: 'lotes', component: LotesView},
    { path: '/configuracoes', name: 'configuracao', component: ConfiguracaoView },
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')

  const paginasPublicas = ['/']
  const precisaAutenticacao = !paginasPublicas.includes(to.path)

  if (precisaAutenticacao && !token) {
    return next('/')
  }

  next()
})

export default router
