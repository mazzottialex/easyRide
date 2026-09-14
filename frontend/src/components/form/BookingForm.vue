<script setup>
import { onMounted, ref } from 'vue'

const currentUser = ref(null)
defineProps({
    bookingData: {
        type: Object,
        required: true
    }
})
const emit = defineEmits(['pickup-click', 'dropoff-click', 'submit'])

const handleBooking = () => {
    emit('submit')
}

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
</script>

<template>
    <div class="col-md-8 col-lg-6 mx-auto">
        <div class="text-center text-secondary mb-4 mt-4">
            <h2 v-if="currentUser" class="display-4 text-dark fw-bold mb-2">
                Ciao {{ currentUser.name }}, dove vuoi andare?
            </h2>
        </div>
        <div class="card shadow-sm border-1 rounded-4">
            <div class="card-body p-4 p-md-5">
                <form @submit.prevent="handleBooking">
                    <div class="mb-4">
                        <label class="form-label fw-semibold text-secondary ms-1">Punto di partenza</label>
                        <button type="button" class="btn btn-light btn-lg w-100 text-start border-0 py-3" @click="emit('pickup-click')">
                            <span class="text-secondary">
                                {{ bookingData.pickup || 'Clicca per scegliere sulla mappa' }}
                            </span>
                        </button>
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-semibold text-secondary ms-1">Destinazione</label>
                        <button type="button" class="btn btn-light btn-lg w-100 text-start border-0 py-3" @click="emit('dropoff-click')">
                            <span class="text-secondary">
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
</template>