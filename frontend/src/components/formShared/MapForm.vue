<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import axios from 'axios'

const mapElement = ref(null)
const routePaths = ref([])
const routePoints = ref([])

let routeCoordinates = []
let map = null
let mapLoaded = false

const emit = defineEmits(['route-calculated'])

const props = defineProps({
  loc: {
    type: Array,
    default: () => []
  },
})

const updateRouteOverlay = () => {
  routePaths.value = routeCoordinates.map(coordinates => coordinates.map((coordinate, index) => {
    const point = map.project(coordinate)
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' '))
  const colors = [
    'blue',
    'green',
    'yellow'
  ]

  routePoints.value = props.loc.map((location, index) => {
      const coordinate = toCoordinates(location)
      if (!coordinate) {
        return null
      }
      const projected = map.project(coordinate)
      return {
        name: `loc-${index}`,
        coordinate: location,
        color: colors[index % colors.length],
        x: projected.x,
        y: projected.y
      }
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



const drawRoute = routes => {
  routeCoordinates = Array.isArray(routes)
    ? routes.filter(route => Array.isArray(route))
    : []
  updateRouteOverlay()
}

const getRoute = async (posA, posB) => {
  const corA = toCoordinates(posA)
  const corB = toCoordinates(posB)
  if (!corA || !corB) {
    return []
  }
  try {
    const response = await axios.get('http://localhost:3000/api/routing/route',{
      params: {
        pickup: corA.join(','),
        destination: corB.join(',')
      }
    })
    return response.data.route?.geometry?.coordinates || []
  } catch (error) {
    console.error( error)
    return []
  }
}

const computeRoute = async () => {
  if (props.loc.length < 2) {
    return []
  }
  const routes = []
  for (let i = 0; i < props.loc.length - 1; i++) {
    const route = await getRoute(
      props.loc[i],
      props.loc[i + 1]
    )
    routes.push(route)
  }
  return routes
}

const refreshRoutes = async () => {
  updateRouteOverlay()
  const routes = await computeRoute()
  drawRoute(routes)
  emit('route-calculated', routes)
}

watch(
  () => props.loc,
  () => updateRouteOverlay(),
  { deep: true }
)

watch(
  () => [props.loc[1], props.loc[2]],
  async () => {
    if (mapLoaded) {
      await refreshRoutes()
    }
  },
  { deep: true }
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
    const routes = await computeRoute()
    drawRoute(routes)
    emit('route-calculated', routes)
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
        <path
          v-for="(path, index) in routePaths"
          :key="index"
          :d="path"
          :class="index === 0 ? 'first-route' : 'second-route'"
        />
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
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-opacity: 0.7;
}
.route-svg .first-route {
  stroke: blue;
}
.route-svg .second-route {
  stroke: red;
}
.route-point {
  stroke: white;
  stroke-width: 2;
}
</style>