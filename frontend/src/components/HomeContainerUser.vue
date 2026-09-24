<script setup>
import axios from "axios"
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useRouter } from 'vue-router'
import BookingForm from "./formUser/BookingForm.vue"
import SelectionLocationForm from "./SelectionLocationForm.vue"
import MapForm from "./MapForm.vue"
import SelectionDriverForm from "./formUser/SelectionDriverForm.vue"
import { getSocket } from '../services/socket'

const currentView = ref('booking')

const bookingData = ref({
  pickup: "",
  dropoff: ""
})
const routeData = ref(null)
const routeError = ref(null)
const selectedDriver = ref(null)
const activeRide = ref(null)
const socket = getSocket()
const router = useRouter()

const ridePrice = computed(() => {
  return 10
})

const openPickupMap = () => {
  currentView.value = 'pickup'
}
const openDropoffMap = () => {
  currentView.value = 'dropoff'
}

const handleLocationSelected = (coordinates) => {
  if (currentView.value === 'pickup') {
    bookingData.value.pickup = coordinates
  }
  if (currentView.value === 'dropoff') {
    bookingData.value.dropoff = coordinates
  }
  currentView.value = 'booking'
}

const handleRideCreated = (ride) => {
  activeRide.value = ride
  currentView.value = 'ride'
}

const handleRideStatusChanged = (ride) => {
  if (activeRide.value?._id === ride._id) {
    activeRide.value = ride
  }
}

const handleRequestError = error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
}

const handleBooking = async () => {
  if (!bookingData.value.pickup || !bookingData.value.dropoff) {
    return
  }
  routeError.value = ''
  try {
    const response = await axios.get('http://localhost:3000/api/routing/route', {
      params: {
        pickup: bookingData.value.pickup.join(','), //es."123.123,123.123"
        destination: bookingData.value.dropoff.join(',')
      }
    })
    routeData.value = response.data
    currentView.value = 'route'
  } catch (error) {
    handleRequestError(error)
  }
}
const handleDriverSelected = async (driver) => {
  selectedDriver.value = driver
}

onMounted(() => socket.on('ride:status-changed', handleRideStatusChanged)) //listener socket
onBeforeUnmount(() => socket.off('ride:status-changed', handleRideStatusChanged))
</script>

<template>
  <BookingForm
    v-if="currentView === 'booking'"
    :booking-data="bookingData"
    @pickup-click="openPickupMap"
    @dropoff-click="openDropoffMap"
    @submit="handleBooking"
  />
  <SelectionLocationForm
    v-else-if="currentView === 'pickup' || currentView === 'dropoff'"
    :type="currentView === 'pickup'?'pickup':'dropoff'"
    @location-selected="handleLocationSelected"
  />
  <template v-else-if="currentView === 'route'">
    <MapForm
      :pickup-location="bookingData.pickup"
      :dropoff-location="bookingData.dropoff"
      :route-data="routeData"
    />
    <SelectionDriverForm
      class="mt-4"
      :pickup="bookingData.pickup"
      :dropoff="bookingData.dropoff"
      :price="ridePrice"
      @driver-selected="handleDriverSelected"
      @ride-created="handleRideCreated"
    />
  </template>
  <div v-else-if="currentView === 'ride'" class="text-center mt-5">
    <h2 class="h4">Richiesta corsa inviata</h2>
    <p class="text-secondary">Stato: {{ activeRide?.status }}</p>
  </div>
  <p v-if="routeError" class="text-danger text-center mt-3">{{routeError}}</p>
</template>
