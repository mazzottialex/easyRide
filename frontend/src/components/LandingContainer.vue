<script setup>
import { onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

</script>

<template>
  <div class="min-vh-100 d-flex justify-content-center align-items-center bg-light">
    <div class="text-center px-4 animate-fade-in-up">
      <h1 class="display-3 fw-bold text-primary mb-3">EASYRIDE</h1>
      <p class="lead text-secondary mb-5">
        Descrizione
      </p>
      
      <router-link 
        to="/registration"
        class="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow"
      >
        Inizia Ora
      </router-link>
    </div>
  </div>
</template>
