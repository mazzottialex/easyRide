<script setup>
defineProps({
  routeData: {
    type: Object,
    default: null
  }
})
</script>

<template>
    <div class="col-md-8 col-lg-6 mx-auto">
        {{ JSON.stringify(routeData) }}       
    </div>
</template>