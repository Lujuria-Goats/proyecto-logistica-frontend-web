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

  // 🟡 RUTAS ADMIN (solo Admin)
  {
    path: '/admin',
    component: Layout,
    meta: { requiresAuth: true, role: "Admin" },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'drivers', name: 'Drivers', component: Drivers },
      { path: 'assignRoutes', name: 'AssignRoutes', component: AssignRoutes },
      { path: 'settings', name: 'Settings', component: Settings }
    ]
  },

  // 🔵 RUTAS DRIVER (solo Driver)
  {
    path: "/driver",
    component: () => import("../views/DriverLayout.vue"),
    meta: { requiresAuth: true, role: "Driver" },
    children: [
      {
        path: "dashboard",
        name: "DriverDashboard",
        component: () => import("../components/driver/DriverDashboard.vue")
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


// 🛡️ GUARDIAN GLOBAL CON VALIDACIÓN DE ROL
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")

  if (!to.meta.requiresAuth) {
    return next()
  }

  // ❌ Si NO hay token bloques todas las rutas protegidas
  if (!token) {
    return next("/login")
  }

  // ✅ Leer el rol del token
  let role = null
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    role = payload.role
  } catch (e) {
    console.error("Token inválido:", e)
    return next("/login")
  }

  // 🛂 Si la ruta requiere un rol específico y NO coincide → redirige
  if (to.meta.role && to.meta.role !== role) {
    if (role === "Driver") return next("/driver/dashboard")
    if (role === "Admin") return next("/admin/dashboard")
    return next("/login")
  }

  next()
})

export default router
