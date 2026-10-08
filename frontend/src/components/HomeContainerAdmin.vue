<script setup>
import PanelForm from '@/components/formAdmin/PanelForm.vue'
import SimulationForm from '@/components/formAdmin/SimulationForm.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="container py-4">
    <PanelForm v-if="route.path === '/admin'" />
    <SimulationForm v-else-if="route.path === '/admin/simulation'" />
  </main>
</template>