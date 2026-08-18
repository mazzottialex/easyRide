import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegistrationPage from '../pages/RegistrationPage.vue';
import RegistrationDriverPage from '../pages/RegistrationDriverPage.vue';
import HomePage from '../pages/HomePage.vue';

const routes = [
    { path: '/', name: "Landing", component: LandingPage },
    { path: '/login', name: "Login", component: LoginPage },
    { path: '/registration', name: "Registration", component: RegistrationPage },
    { path: '/registration-driver', name: "RegistrationDriver", component: RegistrationDriverPage },
    { path: '/home', name: "Home", component: HomePage }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

