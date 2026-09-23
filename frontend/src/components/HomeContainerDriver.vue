<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DriverStatusForm from './formDriver/StatusSelectLocationForm.vue'
import RequestForm from './formDriver/RequestForm.vue'
import SelectionLocationForm from './SelectionLocationForm.vue'
import MapForm from './MapForm.vue/index.js'

const status = ref('unavailable')
const currentView = ref('offline')
const currentUser = ref(null)
const driverLocation = ref(null)
const driverRouteData = ref(null)
const driverRequest = ref(null)
const isOnline = computed(() => status.value === 'available')

const router = useRouter()

const handleRequestError = error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
}
const loadStatus = async () => {
  try {
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
  } catch (error) {
    handleRequestError(error)
  }
}

const toggleStatus = async () => {
  if (!driverLocation.value && status.value !== 'available') {
    return
  }
  try {
    const newStatus = status.value === 'available' ? 'unavailable' : 'available'
    const response = await axios.patch(
      'http://localhost:3000/api/drivers/status',
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    status.value = response.data.status
    currentView.value = isOnline.value ? 'online' : 'offline'
  } catch (error) {
    handleRequestError(error)
  }
}

const openLocationSelection = () => {
  currentView.value = 'selectionLocation'
}

const handleLocationSelected = coordinates => {
  driverLocation.value = coordinates
  if(status.value === 'available')
    currentView.value = 'online'
  else
    currentView.value = 'offline'
}

const showDriverRoute = request => {
  driverRequest.value = request
  driverRouteData.value = { route: request.driverRoute || request.rideRoute }
  currentView.value = 'map'
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
      v-if="currentView !== 'selectionLocation' && currentView !== 'map'"
      :is-online="isOnline"
      :location="driverLocation"
      @toggle-online="toggleStatus"
      @select-location="openLocationSelection"
    />
    <SelectionLocationForm 
      v-if="currentView == 'selectionLocation'"
      type="driver"
      @location-selected="handleLocationSelected"
    />
    <MapForm
      v-if="isOnline || currentView === 'map'"
      :route-data="driverRouteData"
      :driver-location="driverLocation"
      :pickup-location="driverRequest?.pickup"
      :dropoff-location="driverRequest?.dropoff"
    />
    <RequestForm
      v-if="isOnline || currentView === 'map'"
      :driver-location="driverLocation"
      class="mt-4"
      @route-ready="showDriverRoute"
    />
  </main>
</template>
