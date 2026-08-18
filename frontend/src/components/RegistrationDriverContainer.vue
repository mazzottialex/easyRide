<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const router = useRouter()
const registerData = ref({ 
  name: "", 
  email: "", 
  password: "",
  brand: "",
  model: "",
  numberPlate: "",
  color: ""
})

const handleRegister = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/users/register-driver', registerData.value)
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify({ name: response.data.name, email: response.data.email, role: response.data.role }))
    router.push('/home')
  } catch (error) {
    const message = error?.response?.data?.message
    alert(message)
  }
}
</script>

<template>
  <div class="container mt-5 mb-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        
        <div class="text-center mb-5">
          <router-link to="/" class="display-6 fw-bold text-primary text-decoration-none">
            EASYRIDE
          </router-link>
          <p class="text-secondary mt-2 fs-5">Registrazione Driver</p>
        </div>
        
        <form @submit.prevent="handleRegister">
          
          <!-- Sezione Dati Personali -->
          <h5 class="text-primary mb-3">Dati Personali</h5>
          
          <div class="mb-3">
            <label class="form-label">Nome Completo</label>
            <input type="text" class="form-control" v-model="registerData.name" required>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="registerData.email" required>
          </div>
          
          <div class="mb-4">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" v-model="registerData.password" required>
          </div>

          <!-- Sezione Dati Auto -->
          <h5 class="text-primary mt-4 mb-3">Dati Veicolo</h5>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Marca</label>
              <input type="text" class="form-control" v-model="registerData.brand" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Modello</label>
              <input type="text" class="form-control" v-model="registerData.model" required>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Targa</label>
              <input type="text" class="form-control text-uppercase" v-model="registerData.numberPlate">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Colore</label>
              <input type="text" class="form-control" v-model="registerData.color" required>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary w-100 mt-4 py-2 fw-bold">Registrati come Driver</button>
        </form>

        <div class="mt-4 text-center">
          <router-link to="/registration" class="text-decoration-none">Non sei un driver? Registrati qui</router-link>
        </div>

        <div class="mt-3 text-center">
          <router-link to="/login" class="text-decoration-none">Torna al Login</router-link>
        </div>
        
      </div>
    </div>
  </div>
</template>