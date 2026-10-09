const { driverModel } = require('../models/driversModel');
const { vehiclesModel } = require('../models/vehiclesModel');
const { pricingModel } = require('../models/pricingModel');
const { getRoute } = require('../services/osrmServices');

const calculateRidePrice = async ({ driverId, pickup, dropoff }) => {
    const driver = await driverModel.findById(driverId);
    if (!driver) throw new Error('Driver non trovato');

    const vehicle = await vehiclesModel.findOne({ driverId: driver._id });
    if (!driver.location) throw new Error('Posizione del driver non disponibile');

    const pickupRoute = await getRoute(`${driver.location};${pickup}`);
    const rideRoute = await getRoute(`${pickup};${dropoff}`);

    let pricing = await pricingModel.findOne();
    if (!pricing) pricing = await pricingModel.create({});

    const distanceToPickup = Number(pickupRoute.distance) / 1000;
    const pickupEta = Number(pickupRoute.duration) / 60;
    const rideDistance = Number(rideRoute.distance) / 1000;
    const rideDuration = Number(rideRoute.duration) / 60;

    const vehicleMultiplier =
        pricing.vehicleMultipliers?.[vehicle?.type || 'standard'] ?? 1;
    const seatKey = Number(vehicle?.seatsAvailable) >= 8 ? 'eight' : 'four';
    const seatMultiplier = pricing.seatMultipliers?.[seatKey] ?? 1;

    const price = Number((
        pricing.basePrice +
        distanceToPickup * pricing.pickupPerKm +
        pickupEta * pricing.pickupPerMinute +
        rideDistance * pricing.ridePerKm +
        rideDuration * pricing.ridePerMinute
    ) * vehicleMultiplier * seatMultiplier).toFixed(2);

    return {
        price,
        distanceToPickup: Number(distanceToPickup.toFixed(2)),
        pickupEta: Math.ceil(pickupEta),
        rideDistance: Number(rideDistance.toFixed(2)),
        rideDuration: Math.ceil(rideDuration)
    };
};

exports.calculateRidePrice = async (req, res) => {
    try {
        const { driverId, pickup, dropoff } = req.query;
        if (!driverId || !pickup || !dropoff) {
            return res.status(400).json({ error: 'Parametri mancanti' });
        }
        const driver = await driverModel.findOne({_id: driverId, available: true, enabled: { $ne: false }});
        if (!driver) return res.status(409).json({ error: 'Driver non disponibile' });

        res.json(await calculateRidePrice({ driverId, pickup, dropoff }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};