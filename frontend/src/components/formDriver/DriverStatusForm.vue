<script setup>
import { onMounted, ref } from 'vue'

const currentUser = ref(null)
defineProps({
  isOnline: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggle-online'])

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
        <h1 class="h3 fw-bold text-dark mb-4">Ciao {{ currentUser?.name }}, sei offline!</h1>
        <button
          type="button"
          class="btn btn-primary btn-lg w-100 rounded-pill fw-bold"
          @click="$emit('toggle-online')"
        >
          Vai online
        </button>
      </div>
    </div>
  </div>
</template>
