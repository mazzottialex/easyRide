<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue"
import BookingForm from "./formUser/BookingForm.vue"
import SelectionLocationForm from "./formShared/SelectionLocationForm.vue"
import MapForm from "./formShared/MapForm.vue"
import SelectionDriverForm from "./formUser/SelectionDriverForm.vue"
import { getSocket } from '../services/socket'
import ControlRideForm from "./formUser/ControlRideFormUser.vue"
import axios from 'axios'

const currentView = ref('booking')

const bookingData = ref({
  pickup: "",
  dropoff: ""
})
const activeRide = ref(null)
const socket = getSocket()

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
  activeRide.value = ride?.value
  currentView.value = 'ride'
}

//aggiorna ride al cambiamento di stato, se ride presente
const handleRideStatusChanged = (ride) => {
  if (activeRide.value?._id === ride._id) {
    activeRide.value = ride
    if (ride.status === 'cancelled') {
      activeRide.value = null
      currentView.value = 'booking'
    }
  }
}

const handleRideLocationChanged = ({location}) => {
  if (!activeRide.value) {
    return
  }
  activeRide.value.driverLocation = location
}


const handleBooking = async () => {
  currentView.value = 'route'
}
const completeRide = () => {
  activeRide.value = null
  currentView.value = "booking"
}

const restoreActiveRide = async () => {
  const response = await axios.get('http://localhost:3000/api/rides/active')
  if (response.status === 200 && response.data) {
    activeRide.value = response.data
    currentView.value = 'ride'
  }
}

onMounted(async () => {
  socket.on('ride:status-changed', handleRideStatusChanged)
  socket.on('ride:location-changed', handleRideLocationChanged)
  try {
    await restoreActiveRide()
  } catch (error) {
    console.error(error)
  }
}) //listener socket
onBeforeUnmount(() => {
  socket.off('ride:status-changed', handleRideStatusChanged)
  socket.off('ride:location-changed', handleRideLocationChanged)
})
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
        :loc="[null,bookingData.pickup, bookingData.dropoff]"
      />
    </div>
    <SelectionDriverForm
      class="mt-4"
      :pickup="bookingData.pickup"
      :dropoff="bookingData.dropoff"
      @ride-accepted="handleRideAccepted"
    />
  </div>
  <div v-else-if="currentView === 'ride'" class="text-center mt-5">
    <ControlRideForm
      :ride="activeRide"
      @ride-updated="handleRideStatusChanged"
      @ride-completed="completeRide"
    />
    <p class="text-secondary">Stato: {{ activeRide?.status }}</p>
    <div class="w-50 mx-auto">
      <MapForm 
        v-if="activeRide?.status !== 'completed'"
        :loc="[activeRide?.driverLocation, activeRide?.pickup, activeRide?.dropoff]"
      />
    </div>
  </div>
</template>
