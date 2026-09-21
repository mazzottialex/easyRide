<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import DriverStatusForm from './formDriver/DriverStatusForm.vue'
import RequestForm from './formDriver/RequestForm.vue'

const status = ref('unavailable')
const currentView = ref('offline')
const currentUser = ref(null)
const isOnline = computed(() => status.value === 'available')

const loadStatus = async () => {
  const response = await axios.get(
    'http://localhost:3000/api/drivers/status',
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )
  status.value = response.data.status
  currentView.value = isOnline.value ? 'online' : 'offline'
}

const toggleStatus = async () => {
    const newStatus =
        status.value === 'available' ? 'unavailable' : 'available'
    const response = await axios.patch(
        'http://localhost:3000/api/drivers/status',
        {
            status: newStatus
        },
        {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem('token')}`
            }
        }
    )

    status.value = response.data.status
    currentView.value = isOnline.value ? 'online' : 'offline'
}

onMounted(async () => {
  await loadStatus()
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
      @toggle-online="toggleStatus"
    />
    <RequestForm v-if="currentView === 'online'" class="mt-4" />
  </main>
</template>
