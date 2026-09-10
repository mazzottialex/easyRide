<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token');
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
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
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