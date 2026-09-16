<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const mapElement = ref(null)
let map = null

const props = defineProps({
  routeData: {
    type: Object,
    default: null
  }
})
const route = () => routeData?.route

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
      layers: [{
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm'
        }]
    },
    center: [12.244, 44.138],
    zoom: 12
  })
})
      
onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
    <div class="col-md-8 col-lg-6 mx-auto">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div class="card-body p-3">
            <h1 class="h5 text-center text-dark fw-bold mb-3">
              Mappa del percorso
            </h1>
            <h2 class="h5 text-center text-dark fw-bold mb-3">
              Tempo stimato: {{route()?.duration/60 | Math.round}} minuti
              Distanza stimata: {{(route()?.distance/1000).toFixed(1)}} km  
            </h2>
            <div
                ref="mapElement"
                class="map-container"
                style="height: 400px;"
            ></div>
          </div>
        </div>
    </div>
</template>