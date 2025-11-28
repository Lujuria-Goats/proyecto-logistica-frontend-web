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
{
  path: '/admin',
  component: Layout,
  children: [
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
   
  ]
}

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router