<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

let map = null
const mapElement = ref(null)

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
})

onBeforeUnmount(() => {
    map.remove()
})
</script>

<template>
  <div
    ref="mapElement"
    class="container-fluid"
    style="height: 600px;"
  ></div>
</template>