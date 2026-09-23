async function getRoute(coordinates) {
    const url =`http://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Errore OSRM')
    }
    const data = await response.json()
    if (data.code !== 'Ok') {
      throw new Error(data.message)
    }
    return data.routes[0]
}
module.exports = { getRoute }