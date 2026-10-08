<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('users')
const users = ref([])
const drivers = ref([])
const rides = ref([])
const pricing = ref(null)
const errorMessage = ref('')
const saved = ref(false)

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const api = async (method, url, data) => {
  try {
    return await axios({ 
      method: method,
      url: `http://localhost:3000/api/admin${url}`,
      data: data,
      headers: authConfig().headers
    })
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    throw error
  }
}

const loadUsers = async () => { 
  users.value = (await api('get', '/users')).data 
}
const loadDrivers = async () => {
  drivers.value = (await api('get', '/drivers')).data
}
const loadRides = async () => {
  rides.value = (await api('get', '/rides')).data
}
const loadPricing = async () => {
  pricing.value = (await api('get', '/pricing')).data
}

const loadAll = async () => {
  errorMessage.value = ''
  try {
    await Promise.all([loadUsers(), loadDrivers(), loadRides(), loadPricing()])
  } catch (error) {
    errorMessage.value = error.response?.data?.error
  }
}

const savePricing = async () => {
  try {
    await api('put', '/pricing', pricing.value)
    saved.value = true
  } catch (error) {
    alert(error.response?.data?.error)
  }
}

const refreshTab = async () => {
  if (activeTab.value === 'users') await loadUsers()
  if (activeTab.value === 'drivers') await loadDrivers()
  if (activeTab.value === 'rides') await loadRides()
  if (activeTab.value === 'pricing') await loadPricing()
}

const formatDate = value => value ? new Date(value).toLocaleString('it-IT') : '-'
const money = value => `${Number(value ?? 0).toFixed(2)} €`

onMounted(loadAll)
</script>

<template>
  <main class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="fw-bold mb-1">Pannello Admin</h1>
      </div>
      <button class="btn btn-outline-primary" @click="refreshTab" :disabled="loading">Aggiorna</button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <template v-else>
      <ul class="nav nav-pills gap-2 mb-4">
        <li class="nav-item"><button class="nav-link" :class="{active: activeTab === 'users'}" @click="activeTab='users'">Utenti</button></li>
        <li class="nav-item"><button class="nav-link" :class="{active: activeTab === 'drivers'}" @click="activeTab='drivers'">Driver</button></li>
        <li class="nav-item"><button class="nav-link" :class="{active: activeTab === 'rides'}" @click="activeTab='rides'">Corse</button></li>
        <li class="nav-item"><button class="nav-link" :class="{active: activeTab === 'pricing'}" @click="activeTab='pricing'">Prezzi</button></li>
      </ul>

      <section v-if="activeTab === 'users'" class="card border-0 shadow-sm rounded-4">
        <div class="card-body">
          <h2 class="h5 fw-bold mb-3">Utenti registrati</h2>
          <div class="table-responsive">
            <table class="table align-middle">
              <thead><tr><th>Nome</th><th>Email</th><th>Ruolo</th></tr></thead>
              <tbody>
                <tr v-for="user in users" :key="user._id">
                  <td>{{ user.name }}</td><td>{{ user.email }}</td><td><span class="badge text-bg-light">{{ user.role }}</span></td>
                </tr>
                <tr v-if="!users.length"><td colspan="3" class="text-secondary">Nessun utente</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'drivers'" class="card border-0 shadow-sm rounded-4">
        <div class="card-body">
          <h2 class="h5 fw-bold mb-3">Driver</h2>
          <div class="table-responsive">
            <table class="table align-middle">
              <thead><tr><th>Nome</th><th>Email</th><th>Stato</th><th>Veicolo</th><th>Posti</th></tr></thead>
              <tbody>
                <tr v-for="driver in drivers" :key="driver._id">
                  <td>{{ driver.userId?.name }}</td>
                  <td>{{ driver.userId?.email }}</td>
                  <td><span :class="driver.available ? 'badge text-bg-success' : 'badge text-bg-secondary'">{{ driver.available ? 'Online' : 'Offline' }}</span></td>
                  <td>{{ driver.vehicle ? `${driver.vehicle.brand} ${driver.vehicle.model} (${driver.vehicle.type})` : '-' }}</td>
                  <td>{{ driver.vehicle?.seatsAvailable ?? '-' }}</td>
                </tr>
                <tr v-if="!drivers.length"><td colspan="5" class="text-secondary">Nessun driver</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'rides'" class="card border-0 shadow-sm rounded-4">
        <div class="card-body">
          <h2 class="h5 fw-bold mb-3">Corse</h2>
          <div class="table-responsive">
            <table class="table align-middle">
              <thead><tr><th>Data</th><th>Utente</th><th>Driver</th><th>Da</th><th>A</th><th>Stato</th><th>Prezzo</th></tr></thead>
              <tbody>
                <tr v-for="ride in rides" :key="ride._id">
                  <td>{{ formatDate(ride.dateTime) }}</td>
                  <td>{{ ride.passengerId?.name ?? '-' }}</td>
                  <td>{{ ride.driverId?.userId?.name ?? '-' }}</td>
                  <td class="small">{{ ride.pickup }}</td>
                  <td class="small">{{ ride.dropoff }}</td>
                  <td><span class="badge text-bg-light">{{ ride.status }}</span></td>
                  <td class="fw-semibold">{{ money(ride.price) }}</td>
                </tr>
                <tr v-if="!rides.length"><td colspan="7" class="text-secondary">Nessuna corsa</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section v-else class="card border-0 shadow-sm rounded-4">
        <div class="card-body">
          <h2 class="h5 fw-bold mb-1">Gestione prezzi</h2>

          <div v-if="pricing" class="row g-3">
            <div v-if="saved" class="col-12">
              <div class="alert alert-success">
                Nuovi prezzi salvati
              </div>
            </div>
            <div class="col-md-6 col-lg-4">
              <label class="form-label">Prezzo base (€)</label>
              <input v-model.number="pricing.basePrice" type="number" min="0" step="0.01" class="form-control">
            </div>
            <div class="col-md-6 col-lg-4">
              <label class="form-label">€/km corsa</label>
              <input v-model.number="pricing.ridePerKm" type="number" min="0" step="0.01" class="form-control">
            </div>
            <div class="col-md-6 col-lg-4">
              <label class="form-label">€/km verso pickup</label>
              <input v-model.number="pricing.pickupPerKm" type="number" min="0" step="0.01" class="form-control">
            </div>
            <div class="col-md-6 col-lg-4">
              <label class="form-label">€/min corsa</label>
              <input v-model.number="pricing.ridePerMinute" type="number" min="0" step="0.01" class="form-control">
            </div>
            <div class="col-md-6 col-lg-4">
              <label class="form-label">€/min verso pickup</label>
              <input v-model.number="pricing.pickupPerMinute" type="number" min="0" step="0.01" class="form-control">
            </div>

            <div class="col-12 mt-4"><h3 class="h6 fw-bold">Moltiplicatori veicolo</h3></div>
            <div class="col-md-4">
              <label class="form-label">Lowcost</label>
              <input v-model.number="pricing.vehicleMultipliers.lowcost" type="number" min="0" step="0.01" class="form-control">
            </div>
            <div class="col-md-4">
              <label class="form-label">Standard</label>
              <input v-model.number="pricing.vehicleMultipliers.standard" type="number" min="0" step="0.01" class="form-control">
            </div>
            <div class="col-md-4">
              <label class="form-label">Premium</label>
              <input v-model.number="pricing.vehicleMultipliers.premium" type="number" min="0" step="0.01" class="form-control">
            </div>

            <div class="col-12 mt-4"><h3 class="h6 fw-bold">Moltiplicatori posti</h3></div>
            <div class="col-md-6">
              <label class="form-label">4 posti</label>
              <input v-model.number="pricing.seatMultipliers.four" type="number" min="0" step="0.01" class="form-control">
            </div>
            <div class="col-md-6">
              <label class="form-label">8 posti</label>
              <input v-model.number="pricing.seatMultipliers.eight" type="number" min="0" step="0.01" class="form-control">
            </div>

            <div class="col-12 mt-3">
              <button class="btn btn-primary px-4" @click="savePricing">Salva prezzi</button>
            </div>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>
