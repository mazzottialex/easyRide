<script setup>
import axios from "axios"
import { onMounted, ref } from "vue"
import router from "../routes/router"
import MapContainer from './MapContainer.vue'

const currentUser = ref(null)

const bookingData = ref({
  pickup: "",
  dropoff: "",
})

const locationSelectorVisible = ref(false)
const selectingLocation = ref(null) //pickup o dropoff

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

const openMapForm = (type) => {
  selectingLocation.value = type
  locationSelectorVisible.value = true
}

const handleLocationSelected = (coordinates) => {
  if (selectingLocation.value === 'pickup') {
    bookingData.value.pickup = coordinates
  }
  if (selectingLocation.value === 'dropoff') {
    bookingData.value.dropoff = coordinates
  }
  locationSelectorVisible.value = false
  selectingLocation.value = null
}

const handleBooking = async () => {

}
</script>

<template>
  <div class="container">
    <div v-if="locationSelectorVisible" class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div class="card-body p-3">
            <h2 class="h5 text-center text-dark fw-bold mb-3">
              Scegli la posizione di {{ selectingLocation }}
            </h2>
            <MapContainer
              @location-selected="handleLocationSelected"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="row justify-content-center">
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
                  <button type="button" class="btn btn-light btn-lg w-100 text-start border-0 py-3" @click="openMapForm('pickup')">
                    <span :class="{ 'text-secondary': !bookingData.pickup }">
                      {{ bookingData.pickup || 'Clicca per scegliere sulla mappa' }}
                    </span>
                  </button>
              </div>
              <div class="mb-4">
                <label class="form-label fw-semibold text-secondary ms-1">Destinazione</label>
                  <button type="button" class="btn btn-light btn-lg w-100 text-start border-0 py-3" @click="openMapForm('dropoff')">
                    <span :class="{ 'text-secondary': !bookingData.dropoff }">
                      {{ bookingData.dropoff || 'Clicca per scegliere sulla mappa' }}
                    </span>
                  </button>
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
