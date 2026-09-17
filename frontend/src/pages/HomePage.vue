<script setup>
import { onMounted, ref } from 'vue'
import HomeContainerUser from "@/components/HomeContainerUser.vue"
import HomeContainerDriver from "@/components/HomeContainerDriver.vue"
import NavbarContainer from '@/components/NavbarContainer.vue'

const currentUser = ref(null)

onMounted(() => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      currentUser.value = JSON.parse(user);
    } catch (error) {
      currentUser.value = { name: user };
    }
  }
})
</script>

<template>
  <NavbarContainer />
  <HomeContainerUser v-if="currentUser?.role === 'user'" />
  <HomeContainerDriver v-else-if="currentUser?.role === 'driver'" />
</template>
