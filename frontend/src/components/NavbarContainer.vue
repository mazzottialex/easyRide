<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const currentUser = computed(() => JSON.parse(localStorage.getItem('user') || 'null'))

const handleLogout = async () => {
  await axios.post('http://localhost:3000/api/users/logout');
  localStorage.removeItem('user');
  router.push('/login');
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">EASYRIDE</router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
          <li v-if="currentUser?.role !== 'admin'" class="nav-item">
            <router-link class="nav-link" to="/history">Storico corse</router-link>
          </li>
          <li v-if="currentUser?.role === 'admin'" class="nav-item">
            <router-link class="nav-link" to="/admin">Pannello Admin</router-link>
          </li>
        </ul>
        
        <div class="d-flex align-items-center">
          <button @click="handleLogout" class="btn btn-outline-light btn-sm rounded-pill px-3">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>