<script setup>
import axios from "axios"
import { onMounted, ref } from "vue"
import BookingForm from "./form/BookingForm.vue"
import SelectionLocationForm from "./form/SelectionLocationForm.vue"

const currentView = ref('booking')

const bookingData = ref({
  pickup: "",
  dropoff: ""
})
const loadingRoute = ref(false)

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

onMounted(() => {
})

const handleBooking = async () => {
  if (!bookingData.value.pickup || !bookingData.value.dropoff) {
    return
  }
  currentView.value = 'booking'
}
</script>

<template>
  <BookingForm
    v-if="currentView === 'booking'"
    :booking-data="bookingData"
    :loading="loadingRoute"
    @pickup-click="openPickupMap"
    @dropoff-click="openDropoffMap"
    @submit="handleBooking"
  />
  <SelectionLocationForm
    v-else-if="currentView === 'pickup' || currentView === 'dropoff'"
    :type="currentView === 'pickup'?'pickup':'dropoff'"
    @location-selected="handleLocationSelected"
  />
</template>
