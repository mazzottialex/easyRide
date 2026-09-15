<script setup>
import axios from "axios"
import { onMounted, ref } from "vue"
import BookingForm from "./form/BookingForm.vue"
import SelectionLocationForm from "./form/SelectionLocationForm.vue"
import MapForm from "./form/MapForm.vue"

const currentView = ref('booking')

const bookingData = ref({
  pickup: "",
  dropoff: ""
})
const routeData = ref(null)
const routeError = ref('')

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
    routeError.value = error
  }
}
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
  <MapForm
    v-else-if="currentView === 'route'"
    :pickup-location="bookingData.pickup"
    :dropoff-location="bookingData.dropoff"
    :route-data="routeData"
  />
  <p v-if="routeError" class="text-danger text-center mt-3">{{routeError}}</p>
</template>
