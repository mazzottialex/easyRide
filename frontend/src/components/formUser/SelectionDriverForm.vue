<script setup>
import axios from 'axios'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getSocket } from '../../services/socket'

const emit = defineEmits(['driver-selected'])
const availableDrivers = ref([])
const selectedDriver = ref(null)
const errorMessage = ref(null)
const socket = getSocket()

const loadDrivers = async () => {
    try {
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
const selectDriver = (driver) => {
    selectedDriver.value = driver
    emit('driver-selected', driver)
}

const requestDriver = () => {
}

onMounted(() => {
    loadDrivers()
    socket.on('driver:status-changed', loadDrivers)
})
onBeforeUnmount(() => {
    socket.off('driver:status-changed', loadDrivers)
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
                    <button type="button" class="btn btn-link p-0" @click="loadDrivers">Riprova</button>
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
                            class="btn btn-light border d-flex align-items-center gap-3 text-start p-3"
                            :class="selectedDriver?._id === driver._id ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle'"
                            role="radio"
                            @click="selectDriver(driver)"
                        >
                            <span class="d-grid gap-1">
                                <strong>{{ driver.userId?.name }}</strong>
                                <small class="text-secondary">{{ driver.userId?.email }}</small>
                                <small class="text-secondary">{{ driver.vehicle?.brand }} {{ driver.vehicle?.model }}</small>
                                <small class="text-secondary">Posti disponibili: {{ driver.vehicle?.seatsAvailable }}</small>
                            </span>
                            <span v-if="selectedDriver?._id === driver._id" class="ms-auto text-primary fw-bold">Selezionato</span>
                        </button>
                    </div>
                    <div v-if="selectedDriver" class="alert alert-primary mt-3 mb-0 d-flex justify-content-between align-items-center gap-3" role="status">
                        <div>
                            <div class="fw-bold small">Conferma richiesta</div>
                                Vuoi inviare la richiesta a {{ selectedDriver.userId?.name }}?
                        </div>
                        <button type="button" class="btn btn-primary btn-sm text-nowrap" @click="requestDriver">
                            Conferma richiesta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>