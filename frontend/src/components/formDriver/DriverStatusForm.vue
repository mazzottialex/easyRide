<script setup>
import { onMounted, ref } from 'vue'

const currentUser = ref(null)
const props = defineProps({
  isOnline: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggle-online'])

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
  <div class="col-12 col-md-8 col-lg-6 mx-auto">
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4 p-md-5 text-center">
        <div class="d-flex gap-3">
          <h1 class="h3 fw-bold text-dark mb-2">Ciao {{ currentUser?.name }}</h1>
          <div class="mb-4">
            <span
              class="badge rounded-pill px-3 py-2"
              :class="props.isOnline ? 'text-bg-success' : 'text-bg-secondary'"
            >
              {{ props.isOnline ? 'Online' : 'Offline' }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-lg w-100 rounded-pill fw-bold"
          @click="emit('toggle-online')"
        >
          {{ props.isOnline ? 'Vai offline' : 'Vai online' }}
        </button>
      </div>
    </div>
  </div>
</template>
