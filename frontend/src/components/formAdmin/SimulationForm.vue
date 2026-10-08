<script setup>
import { ref } from 'vue'

const speed = ref(1)
const bots = ref(0)
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
            Bot attivi: {{ bots }}
          </span>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" @click="addBot">
            Aggiungi bot
          </button>
          <button class="btn btn-outline-danger btn-sm" @click="removeBots">
            Elimina tutti i bot
          </button>
        </div>
      </div>
    </div>
  </section>
</template>