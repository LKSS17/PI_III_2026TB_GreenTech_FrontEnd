import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import EstoqueView from '../views/EstoqueView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/estoque', name: 'estoque', component: EstoqueView }
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
