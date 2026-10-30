/**
 * Cars & Coffee — Vue Router Configuration & Navigation Guards (Syed's Feature)
 * Uses createWebHashHistory() so page refreshes never 404 on Swinburne's Mercury Web Server.
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import HomeView from '../views/HomeView.vue'
import MeetsListView from '../views/MeetsListView.vue'
import MeetDetailView from '../views/MeetDetailView.vue'
import MeetFormView from '../views/MeetFormView.vue'
import FeedView from '../views/FeedView.vue'
import ExploreMapView from '../views/ExploreMapView.vue'
import SavedMeetsView from '../views/SavedMeetsView.vue'
import GarageProfileView from '../views/GarageProfileView.vue'
import InsightsView from '../views/InsightsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home — Cars & Coffee Community Hub', access: 'public' }
  },
  {
    path: '/meets',
    name: 'meets',
    component: MeetsListView,
    meta: { title: 'Browse Coffee Meets — Cars & Coffee', access: 'public' }
  },
  {
    path: '/meets/new',
    name: 'meet-create',
    component: MeetFormView,
    meta: { title: 'Host a Cars & Coffee Meet', requiresAuth: true }
  },
  {
    path: '/meets/:id/edit',
    name: 'meet-edit',
    component: MeetFormView,
    meta: { title: 'Edit Meet — Cars & Coffee', requiresAuth: true }
  },
  {
    path: '/meets/:id',
    name: 'meet-detail',
    component: MeetDetailView,
    meta: { title: 'Meet Details & Car Roll-Call — Cars & Coffee', access: 'public' }
  },
  {
    path: '/feed',
    name: 'feed',
    component: FeedView,
    meta: { title: 'Car Spotting & Build Feed — Cars & Coffee', access: 'public' }
  },
  {
    path: '/map',
    name: 'map',
    component: ExploreMapView,
    meta: { title: 'Interactive Map & Meet Calendar — Cars & Coffee', access: 'public' }
  },
  {
    path: '/saved',
    name: 'saved',
    component: SavedMeetsView,
    meta: { title: 'My Meets & Offline Vault — Cars & Coffee', requiresAuth: true }
  },
  {
    path: '/garage',
    name: 'garage',
    component: GarageProfileView,
    meta: { title: 'My Garage & Profile — Cars & Coffee', requiresAuth: true }
  },
  {
    path: '/insights',
    name: 'insights',
    component: InsightsView,
    meta: { title: 'Community Insights & Moderation — Cars & Coffee', access: 'public' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Sign In — Cars & Coffee', guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'Join the Community — Cars & Coffee', guestOnly: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta && to.meta.title && typeof document !== 'undefined') {
    document.title = to.meta.title
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next('/meets')
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath, notice: 'auth_required' }
    })
  }

  return next()
})

export default router
