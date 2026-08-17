<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import axios from 'axios';

const router = useRouter();
const registerData = ref({ name: "", email: "", password: "" })

const handleRegister = async () => {
  console.log("Register:", registerData.value)
  try {
    await axios.post('http://localhost:3000/api/users/register', registerData.value);
    router.push('/login');
  } catch (error) {
    const message = error?.response?.data?.message || 'Errore durante la registrazione';
    alert(message);
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="mb-4 text-center">Registrazione</h2>
        
        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label class="form-label">Nome</label>
            <input type="text" class="form-control" v-model="registerData.name" required>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="registerData.email" required>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" v-model="registerData.password" required>
          </div>
          
          <button type="submit" class="btn btn-primary w-100">Registrati</button>
        </form>
        
        <div class="mt-3 text-center">
          <router-link to="/login">Torna al Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>