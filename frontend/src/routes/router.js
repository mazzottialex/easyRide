import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegistrationPage from '../pages/RegistrationPage.vue';
import RegistrationDriverPage from '../pages/RegistrationDriverPage.vue';
import HomePage from '../pages/HomePage.vue';
import HistoryPage from '../pages/HystoryPage.vue';
import AdminPage from '../pages/AdminPage.vue';
import axios from 'axios';

const routes = [
    { path: '/', name: "Landing", component: LandingPage, meta: { requiresGuest: true } },
    { path: '/login', name: "Login", component: LoginPage, meta: { requiresGuest: true } },
    { path: '/registration', name: "Registration", component: RegistrationPage, meta: { requiresGuest: true } },
    { path: '/registration-driver', name: "RegistrationDriver", component: RegistrationDriverPage, meta: { requiresGuest: true } },
    { path: '/home', name: "Home", component: HomePage, meta: { requiresAuth: true } },
    { path: '/history', name: "History", component: HistoryPage, meta: { requiresAuth: true } },
    { path: '/admin', name: "Admin", component: AdminPage, meta: { requiresAuth: true, requiresAdmin: true } }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
  let user = JSON.parse(localStorage.getItem('user') || 'null');
  let isAuthenticated = false;

  try {
    const response = await axios.get('http://localhost:3000/api/users/me');
    user = response.data;
    isAuthenticated = true;
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    localStorage.removeItem('user');
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/home');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next(user?.role === 'admin' ? '/admin' : '/home');
  } else {
    next();
  }
});

export default router;

