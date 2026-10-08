<script setup>
import axios from 'axios'
import { ref } from 'vue'

const props = defineProps({
  ride: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['ride-updated', 'ride-completed'])
const errorMessage = ref(null)

const updateStatus = async status => {
  try {
    errorMessage.value = null
  const response = await axios.patch(
    `http://localhost:3000/api/rides/${props.ride._id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )
    emit('ride-updated', response.data)
  } catch (error) {
    errorMessage.value = error.response?.data?.error
  }
}

const completeRide = async () => {
    emit('ride-completed')
}
</script>

<template>
  <div class="col-12 col-md-8 col-lg-6 mx-auto">
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>
        <h2 class="h5 fw-bold">Corsa {{ props.ride.status }}</h2>
        <p class="mb-3 text-secondary">{{ props.ride.pickup }} → {{ props.ride.dropoff }}</p>
        <button
          v-if="props.ride.status === 'accepted'"
          type="button"
          class="btn btn-primary w-100 rounded-pill fw-bold"
          @click="updateStatus('arriving')"
        >
          Vai dal passeggero
        </button>
        <p v-else-if="props.ride.status === 'arriving'" class="text-secondary mb-3">In viaggio verso il passeggero...</p>
        <p v-else-if="props.ride.status === 'arrived'" class="text-secondary mb-3">Attendi che il passeggero salga a bordo...</p>
        <p v-else-if="props.ride.status === 'in_progress'" class="text-secondary mb-3">In viaggio verso la destinazione...</p>
        <button
          v-if="props.ride.status === 'completed'"
          type="button"
          class="btn btn-success w-100 rounded-pill fw-bold"
          @click="completeRide()"
        >
          Corsa completata, torna al menu principale
        </button>
      </div>
    </div>
  </div>
</template>
