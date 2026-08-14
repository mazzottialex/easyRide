<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const loginData = ref({ email: "", password: "" })

const handleLogin = () => {
  console.log("Login:", loginData.value)
}
</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="mb-4 text-center">Login</h2>
        
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="loginData.email" required>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" v-model="loginData.password" required>
          </div>
          
          <button type="submit" class="btn btn-primary w-100">Accedi</button>
        </form>
        
        <div class="mt-3 text-center">
          <router-link to="/registration">Vai alla Registrazione</router-link>
        </div>
      </div>
    </div>
  </div>
</template>