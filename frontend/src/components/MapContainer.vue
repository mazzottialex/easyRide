<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Map, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'


const emit = defineEmits(['location-selected']) //invio al padre la location
const mapElement = ref(null)
let map = null

onMounted(() => {
  map = new Map({
    container: mapElement.value,
    style: {
        version: 8,
        sources: {
        osm: {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm'
        }
      ]
    },
    center: [12.244, 44.138],
    zoom: 12
  })
  map.on('click', (event) => {
    const coordinates = [event.lngLat.lng, event.lngLat.lat]
    emit('location-selected', coordinates)
  })
})
      
onBeforeUnmount(() => {
    map.remove()
})
</script>

<template>
  <div
    ref="mapElement"
    class="container-fluid"
    style="height: 400px;"
  ></div>
</template>