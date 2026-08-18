<script setup>
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import axios from 'axios'

const router = useRouter();
const registerData = ref({ name: "", email: "", password: "" })

const handleRegister = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/users/register', registerData.value);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({ name: response.data.name, email: response.data.email, role: response.data.role }));
    router.push('/home');
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
          <div class="text-center mb-5">
          <router-link to="/" class="display-6 fw-bold text-primary text-decoration-none">
            EASYRIDE
          </router-link>
          <p class="text-secondary mt-2 fs-5">Registrazione</p>
        </div>
        
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
          <router-link to="/registration-driver">Sei un driver? Registrati qui</router-link>
        </div>

        <div class="mt-3 text-center">
          <router-link to="/login">Torna al Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>