<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import DriverStatusForm from './formDriver/DriverStatusForm.vue'
import RequestForm from './formDriver/RequestForm.vue'

const isOnline = ref(false)
const currentView = ref('offline')
const currentUser = ref(null)

const toggleOnlineStatus = async () => {
  try {
    await axios.patch(`http://localhost:3000/api/drivers/${currentUser.value._id}/status`, {
      status: !isOnline.value ? 'available' : 'unavailable'
    })
    isOnline.value = !isOnline.value
    currentView.value = isOnline.value ? 'online' : 'offline'
  } catch (error) {
    alert(error?.response?.data?.message)
  }
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
  <main class="container py-5">
    <DriverStatusForm
      :is-online="isOnline"
      @toggle-online="toggleOnlineStatus"
    />
    <RequestForm v-if="currentView === 'online'" class="mt-4" />
  </main>
</template>
