import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegistrationPage from '../pages/RegistrationPage.vue';


const routes = [
    { path: '/', name: "Landing", component: LandingPage },
    { path: '/login', name: "Login", component: LoginPage },
    { path: '/registration', name: "Registration", component: RegistrationPage }

    
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

