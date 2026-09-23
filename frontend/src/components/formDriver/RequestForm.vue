<script setup>
import axios from 'axios'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getSocket } from '../../services/socket'

const props = defineProps({
  driverLocation: {
    type: Array,
    default: null
  }
})

const requests = ref([])
const activeRides = ref([])
const socket = getSocket()

const addRequest = async request => {
  if (request.status !== 'pending') {
    updateActiveRide(request)
    return
  }

  let requestWithRoute = request
  if (props.driverLocation) {
    const response = await axios.get(
      'http://localhost:3000/api/routing/route',
      {
        params: {
          pickup: props.driverLocation.join(','),
          destination: request.pickup
        }
      }
    )
    requestWithRoute = Object.assign({}, request, { driverRoute: response.data.route })
  }

  const rideResponse = await axios.get(
    'http://localhost:3000/api/routing/route',
    {
      params: {
        pickup: request.pickup,
        destination: request.dropoff
      }
    }
  )
  requestWithRoute = Object.assign({}, requestWithRoute, { rideRoute: rideResponse.data.route })

  if (!requests.value.some(currentRequest => currentRequest._id === request._id)) {
    requests.value.push(requestWithRoute)
  }
}

const updateActiveRide = (ride) => {
  requests.value = requests.value.filter(request => request._id !== ride._id)
  if (ride.status === 'cancelled' || ride.status === 'completed') {
    activeRides.value = activeRides.value.filter(currentRide => currentRide._id !== ride._id)
    return
  }
  const index = activeRides.value.findIndex(currentRide => currentRide._id === ride._id)
  if (index === -1) {
    activeRides.value.push(ride)
  } else {
    activeRides.value[index] = ride
  }
}

const respondToRequest = async (request, status) => {
  const response = await axios.patch(
    `http://localhost:3000/api/rides/${request._id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )
  updateActiveRide(response.data)
}

const acceptRequest = request => respondToRequest(request, 'accepted')
const rejectRequest = request => respondToRequest(request, 'cancelled')
const startRide = ride => respondToRequest(ride, 'in_progress')
const completeRide = ride => respondToRequest(ride, 'completed')

onMounted(() => {
  socket.on('ride:request', addRequest)
  socket.on('ride:status-changed', updateActiveRide)
})
onBeforeUnmount(() => {
  socket.off('ride:request', addRequest)
  socket.off('ride:status-changed', updateActiveRide)
})
</script>

<template>
  <div class="col-12 col-md-8 col-lg-6 mx-auto">
    <div v-if="requests.length > 0">
      <div v-for="request in requests" :key="request._id" class="card border-0 shadow-sm rounded-4 mb-3">
        <div class="card-body p-4 p-md-5">
          <h2 class="h4 fw-bold mb-4 text-center">Nuova corsa</h2>
          <div class="mb-3">
            <label class="form-label">Partenza</label>
            <input :value="request.pickup" class="form-control" type="text" readonly />
          </div>
          <div class="mb-3">
            <label class="form-label">Destinazione</label>
            <input :value="request.dropoff" class="form-control" type="text" readonly />
          </div>
          <p v-if="request.driverRoute" class="text-secondary">
            Distanza dal passeggero: {{ (request.driverRoute.distance / 1000).toFixed(1) }} km
          </p>
          <p v-if="request.rideRoute" class="text-secondary">
            Distanza corsa: {{ (request.rideRoute.distance / 1000).toFixed(1) }} km
          </p>
          <p class="text-secondary">
            Prezzo corsa: {{ Number(request.price).toFixed(2) }} €
          </p>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-primary btn-lg w-100 rounded-pill fw-bold" @click="acceptRequest(request)">
              Accetta
            </button>
            <button type="button" class="btn btn-outline-danger btn-lg w-100 rounded-pill fw-bold" @click="rejectRequest(request)">
              Rifiuta
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeRides.length > 0">
      <div v-for="ride in activeRides" :key="ride._id" class="card border-0 shadow-sm rounded-4 mb-3">
        <div class="card-body p-4">
          <h2 class="h5 fw-bold">Corsa {{ ride.status }}</h2>
          <p class="mb-3 text-secondary">{{ ride.pickup }} → {{ ride.dropoff }}</p>
          <div class="d-flex gap-2">
            <button
              v-if="ride.status === 'accepted'"
              type="button"
              class="btn btn-primary w-100 rounded-pill fw-bold"
              @click="startRide(ride)"
            >
              Inizia corsa
            </button>
            <button
              v-if="ride.status === 'in_progress'"
              type="button"
              class="btn btn-success w-100 rounded-pill fw-bold"
              @click="completeRide(ride)"
            >
              Completa corsa
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
