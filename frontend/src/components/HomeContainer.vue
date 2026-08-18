<script setup>
import axios from "axios"
import { onMounted, ref } from "vue"
import router from "../routes/router"

const currentUser = ref(null)

onMounted(() => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      currentUser.value = JSON.parse(user);
    } catch (error) {
      currentUser.value = { name: user };
    }
  }
})

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
}
</script>

<template>
  <div class="min-vh-100 d-flex justify-content-center align-items-center bg-light">
    <div class="text-center px-4 animate-fade-in-up">
      <h1 class="display-3 fw-bold text-primary mb-3">EASYRIDE</h1>
      <p class="lead text-secondary mb-5">
        HOME PAGE
      </p>

      <h2 v-if="currentUser" class="lead text-secondary mb-5">
        Ciao {{ currentUser.name }}
      </h2>

      <button @click="handleLogout" class="btn btn-outline-danger btn-lg rounded-pill px-5">
        Logout
      </button>
    </div>
  </div>
</template>
