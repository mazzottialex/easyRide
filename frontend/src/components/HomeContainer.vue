<script setup>
import axios from "axios"
import { onMounted, ref } from "vue"
import router from "../routes/router"

const currentUser = ref(null)

const bookingData = ref({
  pickup: "",
  dropoff: "",
})

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

const handleBooking = async () => {

}

</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="text-center mb-4 mt-4">
          <h2 v-if="currentUser" class="display-4 text-dark fw-bold mb-2">
            Ciao {{ currentUser.name }}
          </h2>
          <p class="lead text-secondary">Dove vuoi andare?</p>
        </div>
        <div class="card shadow-sm border-1 rounded-4">
          <div class="card-body p-4 p-md-5">
            <form @submit.prevent="handleBooking">
              <div class="mb-4">
                <label class="form-label fw-semibold text-secondary ms-1">Punto di partenza</label>
                <input type="text" v-model="bookingData.pickup"
                  class="form-control form-control-lg bg-light border-0 py-3">
              </div>
              <div class="mb-4">
                <label class="form-label fw-semibold text-secondary ms-1">Destinazione</label>
                <input type="text" v-model="bookingData.dropoff"
                  class="form-control form-control-lg bg-light border-0 py-3">
              </div>
              <button type="submit" class="btn btn-primary btn-lg w-100 rounded-pill fw-bold py-3">
                Cerca un Driver
              </button>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>
