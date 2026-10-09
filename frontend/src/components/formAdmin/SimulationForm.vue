<script setup>
import { onMounted, ref } from 'vue'

const speed = ref(1)
const bots = ref([])
const editingSpeed = ref(false)
const error = ref('')

const load = () => {
}

const saveSpeed = () => {
}

const addBot = () => {
}

const removeBots = () => {
}
const updateBotStatus = () => {
}

onMounted(load)
</script>

<template>
  <section class="card border-0 shadow-sm rounded-4" style="max-width: 800px; margin: 0 auto;">
    <div class="card-body p-4">
      <h2 class="h4 fw-bold mb-5">
        Gestione simulazione
      </h2>
      <div v-if="error" class="alert alert-danger py-2">
        {{ error }}
      </div>
      <div class="border-bottom pb-4 mb-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h3 class="h6 fw-bold mb-1">
              Velocità simulazione
            </h3>
            <span class="text-secondary small">
              Attuale: {{ speed }}×
            </span>
          </div>
          <button v-if="!editingSpeed" class="btn btn-outline-primary btn-sm"  @click="editingSpeed = true">
            Modifica velocità
          </button>
        </div>
        <div v-if="editingSpeed" class="d-flex gap-2 align-items-center">
          <select v-model.number="speed" class="form-select form-select-sm" style="max-width: 400px;">
            <option :value="1">1×</option>
            <option :value="2">2×</option>
            <option :value="5">5×</option>
            <option :value="10">10×</option>
            <option :value="60">60×</option>
          </select>
          <button class="btn btn-primary btn-sm" @click="saveSpeed">
            Salva
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="editingSpeed = false" >
            Annulla
          </button>
        </div>
      </div>
      <div>
        <div class="mb-3">
          <h3 class="h6 fw-bold mb-1">
            Bot Driver
          </h3>
          <span class="text-secondary small">
            Bot configurati: {{ bots.length }}
          </span>
        </div>
        <button class="btn btn-primary btn-sm mb-3" type="button" @click="addBot" :disabled="botActionLoading">
          Aggiungi bot
        </button>
        <div class="d-flex justify-content-end mb-3">
          <button class="btn btn-outline-danger btn-sm" @click="removeBots" :disabled="botActionLoading || !bots.some(bot => bot.enabled !== false)">
            Disabilita tutti i bot inattivi
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead><tr><th>Nome</th><th>Stato</th><th>Classe</th><th>Posti</th><th></th></tr></thead>
            <tbody>
              <tr v-for="bot in bots" :key="bot._id">
                <td>{{ bot.botName || bot.userId?.name || '-' }}</td>
                <td>
                  <span :class="bot.enabled === false ? 'badge text-bg-secondary' : bot.available ? 'badge text-bg-success' : 'badge text-bg-warning'">
                    {{ bot.enabled === false ? 'Disabilitato' : bot.available ? 'Disponibile' : 'In corsa' }}
                  </span>
                </td>
                <td>{{ bot.vehicle?.type || '-' }}</td>
                <td>{{ bot.vehicle?.seatsAvailable ?? '-' }}</td>
                <td class="text-end">
                  <button class="btn btn-sm" :class="bot.enabled === false ? 'btn-outline-success' : 'btn-outline-danger'" @click="updateBotStatus(bot)">
                    {{ bot.enabled === false ? 'Abilita' : 'Disabilita' }}
                  </button>
                </td>
              </tr>
              <tr v-if="!bots.length"><td colspan="5" class="text-secondary">Nessun bot configurato</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>