<script setup>
import axios from 'axios'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getSocket } from '../../services/socket'

const emit = defineEmits(['ride-accepted', 'driver-selected'])
const props = defineProps({
    pickup: { type: [String, Array], required: true },
    dropoff: { type: [String, Array], required: true }
})
const availableDrivers = ref([])
const driverDataMap = ref(new Map())
const selectedDriver = ref(null)
const errorMessage = ref(null)
const requestSent = ref(false)
const requestRejected = ref(false)
const requestError = ref(null)
const socket = getSocket()
const ride = ref(null)

const calculatePrice = async (driver) => {
    const response = await axios.get(
        'http://localhost:3000/api/rides/price',
        {
            params: {
                driverId: driver._id,
                pickup: props.pickup?.join(','),
                dropoff: props.dropoff?.join(',')
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    )
    return response.data
}

const loadDrivers = async () => {
    try {
        errorMessage.value = null
        const response = await axios.get(
            'http://localhost:3000/api/drivers/available',
            {
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem('token')}`
                }
            })
        availableDrivers.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
        errorMessage.value = error.response?.data?.error
    } 
}

const createMap = async () => {
    driverDataMap.value.clear()
    for (const driver of availableDrivers.value) {
        try {
            const data = await calculatePrice(driver)

            const arrivalDate = new Date(Date.now() + (data.pickupEta + data.rideDuration) * 60 * 1000)
            const arrivalTime = arrivalDate.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            })

            const driverData = Object.assign({}, data)
            driverData.arrivalTime = arrivalTime

            driverDataMap.value.set(driver._id, driverData)
        } catch (error) {
            console.error('Errore calcolo prezzo:', error)
        }
    }
}

const selectDriver = driver => {
    selectedDriver.value = driver
    requestRejected.value = false
}

const requestDriver = async () => {
    if (!selectedDriver.value) return
    requestError.value = null
    try {
        const data = driverDataMap.value.get(selectedDriver.value._id)
        const response = await axios.post(
        'http://localhost:3000/api/rides',
        {
            driverId: selectedDriver.value._id,
            pickup: props.pickup?.join(','),
            dropoff: props.dropoff?.join(','),
            price: data.price,
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    )
        requestSent.value = true
        ride.value = response.data
    } catch (error) {
        requestError.value = error.response?.data?.error
    }
}

const handleRideStatusChanged = (rideRec) => {
  if (ride.value?._id === rideRec._id) {
    ride.value = rideRec
  }
  if (ride.value?._id === rideRec?._id && rideRec?.status === 'accepted'){
    emit('ride-accepted', ride)
    emit('driver-selected', selectDriver)
  }
  else if (ride.value?._id === rideRec?._id && rideRec?.status === 'cancelled') {
    requestRejected.value = true
    requestSent.value = false
  }
}

const loadData = async () => {
    await loadDrivers()
    await createMap()
}

onMounted(() => {
    loadData()
    socket.on('driver:status-changed', loadData) //aggiorna lista driver disponibili
    socket.on('ride:status-changed', handleRideStatusChanged) //comunica se la richiesta è stata accettata o rifiutata
})
onBeforeUnmount(() => {
    socket.off('driver:status-changed', loadData)
    socket.off('ride:status-changed', handleRideStatusChanged)
})
</script>

<template>
    <div class="col-md-8 col-lg-6 mx-auto">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div class="card-body p-4">
                <h2 class="h5 text-center text-dark fw-bold mb-3">
                    Scegli un autista
                </h2>
                <div v-if="errorMessage" class="alert alert-danger" role="alert">
                    {{ errorMessage }}
                    <button type="button" class="btn btn-link p-0" @click="loadData">Riprova</button>
                </div>
                <div v-else-if="availableDrivers.length === 0" class="alert alert-secondary" role="status">
                    Nessun autista disponibile
                </div>
                <div v-else>
                    <div class="d-grid gap-2" role="radiogroup" aria-label="Autisti disponibili">
                        <button
                            v-for="driver in availableDrivers"
                            :key="driver._id"
                            type="button"
                            class="btn text-start w-100 p-3 border rounded-3"
                            :class="selectedDriver?._id === driver._id ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle bg-white'"
                            @click="selectDriver(driver)"
                            >
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <strong>{{ driver.userId?.name }}</strong>
                                    <div class="small text-secondary mt-1">
                                        {{ driver.vehicle?.type }} · {{ driver.vehicle?.brand }} {{ driver.vehicle?.model }} · {{ driver.vehicle?.seatsAvailable }} posti
                                    </div>
                                </div>
                                <span v-if="selectedDriver?._id === driver._id" class="text-primary fw-bold small">
                                    Selezionato
                                </span>
                            </div>
                            <div class="border-top pt-2">
                                <div class="d-flex justify-content-between small mb-1">
                                <span class="text-secondary">Arrivo del driver</span>
                                <strong>
                                    tra {{ driverDataMap.get(driver._id)?.pickupEta }} min
                                </strong>
                                </div>
                                <div class="d-flex justify-content-between small mb-1">
                                <span class="text-secondary">Arrivo a destinazione</span>
                                <strong>
                                    {{ driverDataMap.get(driver._id)?.arrivalTime }}
                                </strong>
                                </div>
                                <div class="d-flex justify-content-between align-items-center small">
                                <span class="text-secondary">Distanza corsa</span>
                                <div class="d-flex align-items-center gap-2">
                                    <strong>
                                        {{ driverDataMap.get(driver._id)?.rideDistance }} km - 
                                        {{ driverDataMap.get(driver._id)?.rideDuration }} min
                                    </strong>
                                </div>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                <span class="small text-secondary">Prezzo</span>
                                <strong class="text-primary">
                                    {{ driverDataMap.get(driver._id)?.price}} €
                                </strong>
                            </div>
                        </button>
                    </div>
                    <div v-if="selectedDriver && !requestSent && !requestRejected" class="alert alert-primary mt-3 mb-0 d-flex justify-content-between align-items-center gap-3" role="status">
                        <div>
                            <div class="fw-bold small">Conferma richiesta</div>
                            Vuoi inviare la richiesta a {{ selectedDriver.userId?.name }}?      
                        </div>
                        <button type="button" class="btn btn-primary btn-sm text-nowrap" @click="requestDriver">
                            Conferma richiesta
                        </button>
                    </div>
                    <div v-if="requestSent" class="alert alert-success mt-3 mb-0" role="status">
                        Richiesta inviata. Attendi la risposta del driver.
                    </div>
                    <div v-if="requestError" class="alert alert-danger mt-3 mb-0" role="alert">
                        {{ requestError }}
                    </div>
                    <div v-else-if="requestRejected" class="alert alert-danger mt-3 mb-0" role="status">
                        Il driver ha rifiutato la tua richiesta. Seleziona un altro driver.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>