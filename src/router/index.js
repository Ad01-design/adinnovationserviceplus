import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const routes = [
  {
    path: '/',
    name: 'accueil',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Accueil' },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { title: 'Contact' },
  },
  {
    path: '/equipe',
    name: 'equipe',
    component: () => import('@/views/TeamView.vue'),
    meta: { title: 'Notre équipe' },
  },
  {
    path: '/realisations',
    name: 'realisations',
    component: () => import('@/views/RealisationsView.vue'),
    meta: { title: 'Nos réalisations' },
  },
  {
    path: '/connexion',
    name: 'connexion',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Connexion' },
  },
  {
    // Inscription publique supprimée pour des raisons de sécurité : la création
    // de comptes se fait uniquement côté Supabase (dashboard > Authentication).
    path: '/inscription',
    redirect: { name: 'connexion' },
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, hideChrome: true, title: 'Administration' },
    children: [
      {
        path: '',
        name: 'admin-tableau-de-bord',
        component: () => import('@/views/admin/AdminDashboard.vue'),
        meta: { title: 'Tableau de bord' },
      },
      {
        path: 'services',
        name: 'admin-services',
        component: () => import('@/views/admin/AdminServices.vue'),
        meta: { title: 'Services' },
      },
      {
        path: 'messages',
        name: 'admin-messages',
        component: () => import('@/views/admin/AdminMessages.vue'),
        meta: { title: 'Messages' },
      },
      {
        path: 'parametres',
        name: 'admin-parametres',
        component: () => import('@/views/admin/AdminSettings.vue'),
        meta: { title: 'Paramètres du site' },
      },
      {
        path: 'equipe',
        name: 'admin-equipe',
        component: () => import('@/views/admin/AdminTeam.vue'),
        meta: { title: 'Équipe' },
      },
      {
        path: 'realisations',
        name: 'admin-realisations',
        component: () => import('@/views/admin/AdminRealisations.vue'),
        meta: { title: 'Réalisations' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'introuvable',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page introuvable' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 90, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  document.title = to.meta.title
    ? `${to.meta.title} — AD INNOVATION SERVICES PLUS`
    : 'AD INNOVATION SERVICES PLUS'

  if (!to.meta.requiresAuth) return true

  const { init, isAuthenticated } = useAuth()
  await init()
  if (isAuthenticated.value) return true

  const { info } = useToast()
  info('Connectez-vous pour accéder à l’espace d’administration.')
  return { name: 'connexion', query: { redirect: to.fullPath } }
})

export default router