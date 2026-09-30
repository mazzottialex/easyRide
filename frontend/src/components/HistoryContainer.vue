<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import axios from 'axios'
import { getSocket } from '../services/socket'

const socket = getSocket()

const currentUser = ref(null)
const rides = ref([])
const error = ref('')
const status = ref('')

const statuses = {
  '': 'Tutte',
  pending: 'In attesa',
  accepted: 'Accettata',
  arriving: 'Driver in arrivo',
  arrived: 'Driver arrivato',
  in_progress: 'In corso',
  completed: 'Completata',
  cancelled: 'Annullata'
}

const statusClass = status => {
  const classes = {
    pending: 'text-bg-warning',
    accepted: 'text-bg-primary',
    arriving: 'text-bg-info',
    arrived: 'text-bg-info',
    in_progress: 'text-bg-primary',
    completed: 'text-bg-success',
    cancelled: 'text-bg-danger'
  }
  return classes[status] || 'text-bg-secondary'
}

const isDriver = computed(() => currentUser.value?.role === 'driver')

const loadHistory = async () => {
  error.value = ''
  try {
    const params = {}
    if (status.value) {
      params.status = status.value
    }
    const response = await axios.get(
      'http://localhost:3000/api/rides/history',
      {
        params: params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    rides.value = response.data.rides || []
  } catch (err) {
    error.value = err.response?.data?.error || 'Errore durante il caricamento'
  }
}

const date = value =>
  new Date(value).toLocaleString('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short'
  })

const name = ride =>
  isDriver.value
    ? ride.passengerId?.name
    : ride.driverId?.userId?.name

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    try {
      currentUser.value = JSON.parse(user)
    } catch {
      currentUser.value = null
    }
  }
  loadHistory()
  socket.on('ride:status-changed', loadHistory)
})

onBeforeUnmount(() => {
  socket.off('ride:status-changed', loadHistory)
})
</script>

<template>
  <main class="container py-5" style="max-width: 50em;">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 fw-bold">Storico corse</h1>
      </div>
      <select
        v-model="status"
        class="form-select w-auto rounded-pill"
      >
        <option
          v-for="(label, value) in statuses"
          :key="value"
          :value="value"
        >
          {{ label }}
        </option>
      </select>
    </div>
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    <div v-else-if="!rides.length" class="card border-0 shadow-sm rounded-4">
      <div class="card-body text-center py-5">
        <h2 class="h5 fw-bold">
          Nessuna corsa trovata
        </h2>
      </div>
    </div>
    <div v-else class="d-flex flex-column gap-3">
      <div v-for="ride in rides" :key="ride._id" class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between gap-3">
            <div>
              <h2 class="h5 fw-bold">
                Corsa #{{ ride._id.slice(-6) }}
                <span class="badge rounded-pill" :class="statusClass(ride.status)">
                  {{ statuses[ride.status]}}
                </span>
              </h2>
              <p class="text-secondary">
                {{ date(ride.dateTime) }}
              </p>
              <p class="mb-1">
                <strong>Da:</strong>
                {{ ride.pickup }}
              </p>
              <p>
                <strong>A:</strong>
                {{ ride.dropoff }}
              </p>
              <p class="text-secondary mb-0">
                <strong>
                  {{ isDriver ? 'Passeggero' : 'Driver' }}:
                </strong>
                {{ name(ride) }}
              </p>
            </div>
            <div class="text-end">
              <small class="text-secondary">
                Prezzo
              </small>
              <div class="fs-4 fw-bold">
                € {{ Number(ride.price || 0).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>