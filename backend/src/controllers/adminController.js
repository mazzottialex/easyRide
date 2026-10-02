const { userModel } = require('../models/usersModel');
const { driverModel } = require('../models/driversModel');
const { vehiclesModel } = require('../models/vehiclesModel');
const { ridesModel } = require('../models/ridesModel');
const { pricingModel } = require('../models/pricingModel');

exports.getUsers = async (req, res) => {
    try {
        const users = await userModel.find({ role: { $ne: 'admin' } })
            .select('_id name email role')
            .sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDrivers = async (req, res) => {
    try {
        const drivers = await driverModel.find()
            .populate('userId', 'name email')
            .sort({ _id: -1 });

        const vehicles = await vehiclesModel.find({
            driverId: { $in: drivers.map(driver => driver._id) }
        }).select('driverId brand model numberPlate color seatsAvailable type');

        res.json(drivers.map(driver => ({
            _id: driver._id,
            available: driver.available,
            location: driver.location,
            userId: driver.userId,
            vehicle: vehicles.find(vehicle => vehicle.driverId.toString() === driver._id.toString()
            )
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRides = async (req, res) => {
    try {
        const rides = await ridesModel.find()
            .populate('passengerId', 'name email')
            .populate({
                path: 'driverId',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ dateTime: -1 });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const DEFAULT_PRICING = {
    basePrice: 3,
    ridePerKm: 1.2,
    pickupPerKm: 0.4,
    ridePerMinute: 0.1,
    pickupPerMinute: 0.05,
    vehicleMultipliers: { lowcost: 0.85, standard: 1, premium: 1.4 },
    seatMultipliers: { four: 1, eight: 1.2 }
};

exports.getPricing = async (req, res) => {
    try {
        let pricing = await pricingModel.findOne();
        if (!pricing) {
            pricing = await pricingModel.create(DEFAULT_PRICING);
        }
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePricing = async (req, res) => {
    try {
        const allowed = [
            'basePrice', 'ridePerKm', 'pickupPerKm', 'ridePerMinute', 'pickupPerMinute',
            'vehicleMultipliers', 'seatMultipliers'
        ];
        const update = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) update[key] = req.body[key];
        }

        const pricing = await pricingModel.findOneAndUpdate(
            {},
            { $set: update },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );
        res.json(pricing);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
