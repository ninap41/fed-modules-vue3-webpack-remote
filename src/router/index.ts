import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../views/home/index.vue'
import AboutPage from '../views/about/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => HomePage,
  },
  {
    path: '/about',
    name: 'About',
    component: () => AboutPage,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
