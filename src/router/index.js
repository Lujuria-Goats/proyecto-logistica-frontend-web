import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import Register from "../views/Register.vue";
import Layout from "../views/Layout.vue";
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
    
   
  ]
}

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router