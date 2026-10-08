//cesena coordinates
const BOUNDS = { 
    minLon: 12.17,
    maxLon: 12.32,
    minLat: 44.09,
    maxLat: 44.20
};

module.exports = {
    getRandomCesenaLocation: () => {
        const lon = BOUNDS.minLon+Math.random()*(BOUNDS.maxLon-BOUNDS.minLon);
        const lat = BOUNDS.minLat+Math.random()*(BOUNDS.maxLat-BOUNDS.minLat);
        return `${lon},${lat}`;
    }
};