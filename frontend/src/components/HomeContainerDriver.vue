<script setup>
import axios from 'axios'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DriverStatusForm from './formDriver/StatusSelectLocationForm.vue'
import RequestForm from './formDriver/RequestForm.vue'
import ControlRideForm from './formDriver/ControlRideForm.vue'
import SelectionLocationForm from './SelectionLocationForm.vue'
import MapForm from './MapForm.vue'
import { getSocket } from '../services/socket'

const available = ref(null)
const currentView = ref('offline')
const currentUser = ref(null)
const driverLocation = ref(null)
const currentRide = ref(null)
const rideRoutes = ref([[], []])
const socket = getSocket()

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
    available.value = response.data.available
  } catch (error) {
    handleRequestError(error)
  }
}

const changeStatus = async newStatus => {
  try {
    await axios.post(
      'http://localhost:3000/api/drivers/status',
      { available: newStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    available.value = newStatus
    currentView.value = available.value ? 'online' : 'offline'
  } catch (error) {
    handleRequestError(error)
  }
}

const openLocationSelection = () => {
  currentView.value = 'selectionLocation'
}

const handleLocationSelected = coordinates => {
  driverLocation.value = coordinates
  if(available.value === true)
    currentView.value = 'online'
  else
    currentView.value = 'offline'
}

const handleRideData = ride => {
  currentRide.value = ride
  //const location = driverLocation.value.join(',')
  //socket.emit('driver:location', {rideId: ride.value._id, location}) //invio la posizione allo user
  //currentView.value = 'rideInProgress'
}

const handleRideUpdated = ride => {
  currentRide.value = ride
  if (ride.status === 'accepted') {
    currentView.value = 'rideInProgress'
  }
  else if (ride.status === 'cancelled') {
    currentRide.value = null
    //currentView.value = isOnline.value ? 'online' : 'offline'
  }
  else if (ride.status === 'arriving') {
    sendRoute(rideRoutes.value[0], 'arrived')
  }
  else if (ride.status === 'in_progress') {
    sendRoute(rideRoutes.value[1], 'completed')
  }
}

const sendRoute = async (route, statusAfterSimulation) => {
  if (!currentRide.value || !route?.length) {
    return
  }
  await axios.patch(
    `http://localhost:3000/api/rides/${currentRide.value._id}/route`,
    { route, statusAfterSimulation },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )
}

const handleRouteCalculated = routes => {
  rideRoutes.value = routes
}

const handleRideLocationChanged = location => {
  driverLocation.value = location.split(',').map(Number)
  socket.emit('driver:location', {rideId: currentRide.value._id, location})
}

onMounted(async () => {
  socket.on('ride:location-changed', handleRideLocationChanged)
  socket.on('ride:status-changed', handleRideUpdated)
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

onBeforeUnmount(() => {
  socket.off('ride:location-changed', handleRideLocationChanged)
  socket.off('ride:status-changed', handleRideUpdated)
})
</script>

<template>
  <main class="container py-5">
    <DriverStatusForm
      v-if="currentView !== 'selectionLocation' && currentView !== 'rideInProgress'"
      :is-online="available"
      :location="driverLocation"
      @change-status="changeStatus"
      @select-location="openLocationSelection"
    />
    <SelectionLocationForm 
      v-if="currentView == 'selectionLocation'"
      type="driver"
      @location-selected="handleLocationSelected"
    />
    <RequestForm
      v-if="available && currentView !== 'rideInProgress'"
      :driver-location="driverLocation"
      class="mt-4"
      @ride-data="handleRideData"
    />
    <ControlRideForm
      v-if="currentRide && currentRide?.status !== 'cancelled'"
      :ride="currentRide"
      @ride-updated="handleRideUpdated"
    />
    <div class="w-50 mx-auto">
      <MapForm
        v-if="currentRide && currentRide?.status !== 'cancelled'"
        :loc="[driverLocation, currentRide?.pickup, currentRide?.dropoff]"
        @route-calculated="handleRouteCalculated"
      />
    </div>
  </main>
</template>
