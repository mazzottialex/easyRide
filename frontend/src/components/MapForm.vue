<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import axios from 'axios'

const mapElement = ref(null)
const routePath = ref('')
const routePoints = ref([])
let routeCoordinates = []
let map = null
let mapLoaded = false

const props = defineProps({
  pickupLocation: {
    type: [Array, String],
    default: null
  },
  dropoffLocation: {
    type: [Array, String],
    default: null
  },
  driverLocation: {
    type: [Array, String],
    default: null
  }
})

const updateRouteOverlay = () => {
  routePath.value = routeCoordinates.map((coordinate, index) => {
      const point = map.project(coordinate)
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    }).join(' ')
  const points = [
    { name: 'driver', coordinate: props.driverLocation, color: 'blue' },
    { name: 'pickup', coordinate: props.pickupLocation, color: 'green' },
    { name: 'dropoff', coordinate: props.dropoffLocation, color: 'yellow' }
  ]
  routePoints.value = points.map(({ name, coordinate: location, color }) => {
    const coordinate = toCoordinates(location)
    if (!coordinate) {
      return null
    }
    const projected = map.project(coordinate)
    return { name, coordinate: location, color, x: projected.x, y: projected.y }
  }).filter(Boolean)
}

const toCoordinates = location => {
  if (Array.isArray(location)) {
    return location.map(Number)
  }
  if (typeof location === 'string') {
    return location.split(',').map(value => Number(value.trim()))
  }
  return null
}

const drawRoute = routeData => {
  const coordinates = routeData?.geometry?.coordinates?.map(([longitude, latitude]) => [
    Number(longitude),
    Number(latitude)
  ])
  routeCoordinates = coordinates
  updateRouteOverlay()
}

const computeRoute = async () => {
  const pickup = toCoordinates(props.pickupLocation)
  const destination = toCoordinates(props.dropoffLocation)
  try {
    const response = await axios.get('http://localhost:3000/api/routing/route',{
      params: {
        pickup: pickup.join(','),
        destination: destination.join(',')
      }
    })
    drawRoute(response.data.route)
  } catch (error) {
    alert(error.message)
  }
}

watch(
  () => [
    props.pickupLocation,
    props.dropoffLocation,
    props.driverLocation
  ],
  async () => {
    updateRouteOverlay()
    if (mapLoaded) {
      await computeRoute()
    }
  }
)

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

  map.once('load', async () => {
    mapLoaded = true
    updateRouteOverlay()
    await computeRoute()
  })

  map.on('move', updateRouteOverlay)
})

onBeforeUnmount(() => {
  map?.off('move', updateRouteOverlay)
  map?.remove()
})
</script>

<template>
  <div class="w-100 ">
    <div
      ref="mapElement"
      class="w-100"
      style="height: 400px;"
    >
      <svg class="route-svg w-100 h-100">
        <path :d="routePath" />
        <circle
          v-for="point in routePoints"
          :key="point.name"
          :cx="point.x"
          :cy="point.y"
          class="route-point"
          r="7"
          :fill="point.color"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.route-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
.route-svg path {
  fill: none;
  stroke: red;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.route-point {
  stroke: white;
  stroke-width: 2;
}
</style>