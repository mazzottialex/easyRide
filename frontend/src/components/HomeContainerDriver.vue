<script setup>
import axios from 'axios'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DriverStatusForm from './formDriver/StatusSelectLocationForm.vue'
import RequestForm from './formDriver/RequestForm.vue'
import ControlRideForm from './formDriver/ControlRideForm.vue'
import SelectionLocationForm from './formShared/SelectionLocationForm.vue'
import MapForm from './formShared/MapForm.vue'
import { getSocket } from '../services/socket'

const available = ref(null)
const currentView = ref('offline')
const driverLocation = ref(null)
const currentRide = ref(null)
const restoredRequest = ref(null)
const rideRoutes = ref([[], []])
const activeSimulation = ref(null)
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
    if (response.data.location) {
      driverLocation.value = response.data.location.split(',').map(Number)
    }
  } catch (error) {
    handleRequestError(error)
  }
}

const changeStatus = async newStatus => {
  try {
    const location = newStatus && driverLocation.value?.length
      ? driverLocation.value.join(',')
      : null
    await axios.post(
      'http://localhost:3000/api/drivers/status',
      { av: newStatus, location },
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
  restoredRequest.value = null
  currentRide.value = ride
}

const handleRideUpdated = ride => {
  currentRide.value = ride
  if (ride.status === 'accepted') {
    changeStatus(false)
    currentView.value = 'rideInProgress'
  }
  else if (ride.status === 'cancelled') {
    currentRide.value = null
    activeSimulation.value = null
    currentView.value = available.value ? 'online' : 'offline'
  }
  else if (ride.status === 'arriving' || ride.status === 'in_progress') {
    startSimulationForCurrentRide()
  }
  else if (ride.status === 'completed') {
    activeSimulation.value = null
  }
}

const sendRoute = async (route, statusAfterSimulation) => {
  if (!currentRide.value || !route?.length || activeSimulation.value === `${currentRide.value._id}:${statusAfterSimulation}`) {
    return
  }
  const rideId = currentRide.value._id
  const simulationKey = `${rideId}:${statusAfterSimulation}`
  activeSimulation.value = simulationKey
  try {
    await axios.patch(
    `http://localhost:3000/api/rides/${rideId}/route`,
    { route, statusAfterSimulation },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )
  } catch (error) {
    activeSimulation.value = null
    console.error('Errore avvio simulazione:', error)
  }
}

const handleRouteCalculated = routes => {
  rideRoutes.value = routes
  startSimulationForCurrentRide()
}

const startSimulationForCurrentRide = () => {
  const routes = {
    arriving: [rideRoutes.value[0], 'arrived'],
    in_progress: [rideRoutes.value[1], 'completed']
  }
  const simulation = routes[currentRide.value?.status]
  if (simulation) {
    sendRoute(simulation[0], simulation[1])
  }
}

const handleRideLocationChanged = location => {
  if (currentRide.value.status === 'in_progress' || currentRide.value.status === 'completed') {
    driverLocation.value = location.split(',').map(Number)
    driverLocation.value = null
  }
  else {
    driverLocation.value = location.split(',').map(Number)
  }
  socket.emit('driver:location', {rideId: currentRide.value._id, location})
}

const completeRide = () => {
  currentRide.value = null
  activeSimulation.value = null
  currentView.value = available.value ? 'online' : 'offline'
}

watch(() => currentRide.value?.status,
      () => startSimulationForCurrentRide()
)

const restoreActiveRide = async () => {
  const response = await axios.get('http://localhost:3000/api/rides/active')
  if (response.status === 200 && response.data) {
    driverLocation.value = response.data.driverLocation
      ? response.data.driverLocation.split(',').map(Number)
      : driverLocation.value
    if (response.data.status === 'pending') {
      restoredRequest.value = response.data
      currentView.value = 'online'
    } else {
      currentRide.value = response.data
      currentView.value = 'rideInProgress'
    }
  }
}

onMounted(async () => {
  socket.on('ride:location-changed', handleRideLocationChanged)
  socket.on('ride:status-changed', handleRideUpdated)
  await loadStatus()
  try {
    await restoreActiveRide()
  } catch (error) {
    if (error.response?.status !== 204) {
      handleRequestError(error)
    }
  }
  if (available.value && driverLocation.value === null && !currentRide.value) {
    await changeStatus(false)
  }
})

onBeforeUnmount(() => {
  socket.off('ride:location-changed', handleRideLocationChanged)
  socket.off('ride:status-changed', handleRideUpdated)
})
</script>

<template>
  <main class="container py-5">
    <p1> current ride: {{ currentRide }}</p1>
    <DriverStatusForm
      v-if="currentView !== 'selectionLocation' && !currentRide"
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
      :initial-request="restoredRequest"
      class="mt-4"
      @ride-data="handleRideData"
    />
    <ControlRideForm
      v-if="currentRide && currentRide?.status !== 'cancelled'"
      :ride="currentRide"
      @ride-updated="handleRideUpdated"
      @ride-completed="completeRide"
    />
    <div class="w-50 mx-auto">
      <MapForm
        v-if="currentRide && currentRide?.status !== 'cancelled' && currentRide?.status !== 'completed'"
        :loc="[driverLocation, currentRide?.pickup, currentRide?.dropoff]"
        @route-calculated="handleRouteCalculated"
      />
    </div>
  </main>
</template>
