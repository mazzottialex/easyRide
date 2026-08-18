<script setup>
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const router = useRouter();
const loginData = ref({ email: "", password: "" })

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/users/verify', loginData.value);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({ name: response.data.name, email: response.data.email, role: response.data.role }));
    router.push('/home');
  } catch (error) {
    const message = error?.response?.data?.message;
    alert(message);
  }
}

onMounted(() => {
  if (localStorage.getItem('token')) {
    router.push('/home')
  }
})
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