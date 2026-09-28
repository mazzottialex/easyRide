<script setup>
import axios from 'axios'

const props = defineProps({
  ride: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['ride-updated'])

const updateStatus = async status => {
  const response = await axios.patch(
    `http://localhost:3000/api/rides/${props.ride._id}/status`,
    {
      status
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )
  emit('ride-updated', response.data)
}
</script>

<template>
  <div class="col-12 col-md-8 col-lg-6 mx-auto">
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <h2 class="h5 fw-bold">Corsa {{ props.ride.status }}</h2>
        <p class="mb-3 text-secondary">{{ props.ride.pickup }} in viaggio verso {{ props.ride.dropoff }}</p>
        <p v-if="props.ride.status === 'arriving'" class="text-secondary mb-3">Il driver sta arrivando...</p>
        <button
          v-else-if="props.ride.status === 'arrived'"
          type="button"
          class="btn btn-success w-100 rounded-pill fw-bold"
          @click="updateStatus('in_progress')"
        >
          Sono salito in macchina
        </button>
        <div v-else-if="props.ride.status === 'in_progress'">
          <p class="text-secondary mb-3">In viaggio verso la destinazione...</p>
          <button
            type="button"
            class="btn btn-primary w-100 rounded-pill fw-bold"
            @click="updateStatus('completed')"
          >
            Completa corsa e torna al menu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
