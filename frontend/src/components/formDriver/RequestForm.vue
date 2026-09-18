<script setup>
import { ref } from 'vue'

const requests = ref([
  {
    id: 1,
    pickup: '12.5435, 41.14334',
    destination: '12.2435, 41.15334',
    passengers: 1
  },
  {
    id: 2,
    pickup: '12.5035, 41.13334',
    destination: '12.2835, 41.16334',
    passengers: 2
  }
])

const acceptRequest = () => {
}

const rejectRequest = () => {
}
</script>

<template>
  <div class="col-12 col-md-8 col-lg-6 mx-auto">
    <div v-if="requests.length > 0">
      <div v-for="request in requests" :key="request.id" class="card border-0 shadow-sm rounded-4 mb-3">
        <div class="card-body p-4 p-md-5">
          <h2 class="h4 fw-bold mb-4 text-center">Nuova corsa</h2>
          <div class="mb-3">
            <label class="form-label">Partenza</label>
            <input :value="request.pickup" class="form-control" type="text" readonly />
          </div>
          <div class="mb-3">
            <label class="form-label">Destinazione</label>
            <input :value="request.destination" class="form-control" type="text" readonly />
          </div>
          <div class="mb-4">
            <label class="form-label">Passeggeri</label>
            <input :value="request.passengers" class="form-control" type="number" readonly />
          </div>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-primary btn-lg w-100 rounded-pill fw-bold" @click="acceptRequest(request.id)">
              Accetta
            </button>
            <button type="button" class="btn btn-outline-danger btn-lg w-100 rounded-pill fw-bold" @click="rejectRequest(request.id)">
              Rifiuta
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="card border-0 shadow-sm rounded-4 text-center">
        <div class="card-body p-4">
          <p class="mb-0 text-secondary">Attendi nuove corse</p>
        </div>
      </div>
    </div>
  </div>
</template>
