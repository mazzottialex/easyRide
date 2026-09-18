<script setup>
import { onMounted, ref } from 'vue'
import DriverStatusForm from './formDriver/DriverStatusForm.vue'

const isOnline = ref(false)
const currentView = ref('offline')

const toggleOnlineStatus = () => {
  isOnline.value = !isOnline.value
  currentView.value = 'online'
}

onMounted(() => {
  
})
</script>

<template>
  <main class="container py-5">
    <DriverStatusForm
      v-if="currentView === 'offline'"
      :is-online="isOnline"
      @toggle-online="toggleOnlineStatus"
    />
  </main>
</template>
