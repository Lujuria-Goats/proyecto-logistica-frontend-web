import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import Register from "../views/Register.vue";
import Layout from "../views/Layout.vue";
import Dashboard from "../components/Dashboard.vue";
import Drivers from '../components/Drivers.vue';
import AssignRoutes from '../components/AssignRoutes.vue';
import Settings from '../components/Settings.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },

  // 🟡 RUTAS DEL ADMIN (protegidas)
  {
    path: '/admin',
    component: Layout,
    meta: { requiresAuth: true },   // 👈 marca todo /admin como protegido
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'drivers',
        name: 'Drivers',
        component: Drivers
      },
      {
        path: 'assignRoutes',
        name: 'AssignRoutes',
        component: AssignRoutes
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


// 🛡️ GUARDIAN GLOBAL
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")  // 👈 o "user", como lo manejes

  if (to.meta.requiresAuth && !token) {
    return next("/login")  // 👈 bloquea y redirige
  }

  next()
})

export default router
