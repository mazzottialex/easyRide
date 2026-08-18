import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegistrationPage from '../pages/RegistrationPage.vue';
import RegistrationDriverPage from '../pages/RegistrationDriverPage.vue';
import HomePage from '../pages/HomePage.vue';

const routes = [
    { path: '/', name: "Landing", component: LandingPage, meta: { requiresGuest: true } },
    { path: '/login', name: "Login", component: LoginPage, meta: { requiresGuest: true } },
    { path: '/registration', name: "Registration", component: RegistrationPage, meta: { requiresGuest: true } },
    { path: '/registration-driver', name: "RegistrationDriver", component: RegistrationDriverPage, meta: { requiresGuest: true } },
    { path: '/home', name: "Home", component: HomePage, meta: { requiresAuth: true } }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); 
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); //se non loggato
  } 
  else if (to.meta.requiresGuest && isAuthenticated) {
    next('/home'); //se loggato
  } 
  else {
    next();
  }
});

export default router;

