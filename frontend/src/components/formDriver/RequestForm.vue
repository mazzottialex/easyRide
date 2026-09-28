<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import axios from 'axios'
import { getSocket } from '../../services/socket'
import MapForm from '../MapForm.vue'

const emit = defineEmits(['rideData'])

const props = defineProps({
  driverLocation: {
    type: Array,
    default: null
  }
})

const requests = ref([])
const socket = getSocket()

const addRequest = req => {
  if (
    req.status === 'pending' &&
    !requests.value.some(currentRequest => currentRequest._id === req._id)
  ) {
    requests.value.push(req)
  }
}

const updateStatus = async (request, status) => {
  const response = await axios.patch(
    `http://localhost:3000/api/rides/${request._id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )
  emit('rideData', response.data)
  if(status === 'cancelled'){
    requests.value = requests.value.filter(
    currentRequest => currentRequest._id !== request._id
  )
  }
}

onMounted(() => {
  socket.on('ride:request', addRequest)
})
onBeforeUnmount(() => {
  socket.off('ride:request', addRequest)
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
          <p class="text-secondary">
            Prezzo corsa: {{ Number(request.price).toFixed(2) }} €
          </p>
          <MapForm
            :driver-location="props.driverLocation"
            :pickup-location="request.pickup"
            :dropoff-location="request.dropoff" 
          />
          <div class="d-flex gap-2 mt-4">
            <button type="button" class="btn btn-primary btn-lg w-100 rounded-pill fw-bold" @click="updateStatus(request, 'accepted')">
              Accetta
            </button>
            <button type="button" class="btn btn-outline-danger btn-lg w-100 rounded-pill fw-bold" @click="updateStatus(request, 'cancelled')">
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
