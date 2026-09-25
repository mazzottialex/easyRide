<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
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
const selectedDriver = ref(null)
const activeRide = ref(null)
const socket = getSocket()

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

//ricezione ride
const handleRideAccepted = (ride) => {
  activeRide.value = ride.value
  currentView.value = 'ride'
}

//aggiorna ride al cambiamento di stato, se ride presente
const handleRideStatusChanged = (ride) => {
  if (activeRide.value?._id === ride._id) {
    activeRide.value = ride
  }
}


const handleBooking = async () => {
  currentView.value = 'route'
}
const handleDriverSelected = async (driver) => {
  selectedDriver.value = driver.value
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
  <div v-else-if="currentView === 'route'">
    <div class="w-50 mx-auto">
      <MapForm
        :pickup-location="bookingData.pickup"
        :dropoff-location="bookingData.dropoff"
      />
    </div>
    <SelectionDriverForm
      class="mt-4"
      :pickup="bookingData.pickup"
      :dropoff="bookingData.dropoff"
      :price="ridePrice"
      @driver-selected="handleDriverSelected"
      @ride-accepted="handleRideAccepted"
    />
  </div>
  <div v-else-if="currentView === 'ride'" class="text-center mt-5">
    <p class="text-secondary">Stato: {{ activeRide?.status }}</p>
  </div>
</template>
