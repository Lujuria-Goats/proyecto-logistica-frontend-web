import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import Register from "../views/Register.vue";
import Layout from "../views/Layout.vue";
import Dashboard from "../components/Dashboard.vue";

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

  // 🟡 RUTAS DEL ADMIN (con layout)
  {
    path: '/admin',
    component: Layout,
    children: [
      {
        path: '',               // 👈 /admin directamente
        redirect: 'dashboard'   // 👉 redirige a /admin/dashboard
      },
      {
        path: 'dashboard',      // 👈 SIN el /
        name: 'Dashboard',
        component: Dashboard
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
