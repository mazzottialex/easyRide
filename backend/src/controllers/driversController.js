const { driverModel } = require('../models/driversModel');
const { vehiclesModel } = require('../models/vehiclesModel');
const { getActiveRide, getRideState, saveRideState } = require('../services/rideStateService');

exports.getAvailableDrivers = async (req, res) => {
	try {
		const drivers = await driverModel
			.find({ available: true, enabled: { $ne: false }, location: { $exists: true } })
			.populate('userId', 'name email')

		const driverId = drivers.map(driver => driver._id);
		const vehicles = await vehiclesModel
			.find({ driverId: { $in: driverId } })
			.select('driverId brand model seatsAvailable type')

		const response = drivers.map(driver => {
			return {
				_id: driver._id,
				userId: driver.userId,
				available: driver.available,
				location: driver.location,
				vehicle: vehicles.find(vehicle => vehicle.driverId.toString() === driver._id.toString())
			};
		});
		res.status(200).json(response);
	} catch (error) {
		res.status(500).json({
            error: error.message
        })
	}
};

exports.getDriverStatus = async (req, res) => {
	try {
		const driver = await driverModel.findOne({ userId: req.user.user_Id });
		if (!driver) {
			return res.status(404).json({ error: error.message });
		}
		const rideId = await getActiveRide(req.user.user_Id);
		const state = rideId ? await getRideState(rideId) : null;
		return res.status(200).json({
			available: driver.available,
			location: state?.location || driver.location || null
		});
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.setDriverAvailable = async (req, res) => {
    try {
		const { av, location} = req.body;
        const driver = await driverModel.findOneAndUpdate(
            { userId: req.user.user_Id },
			{ available: av, location: location },
            { new: true }
        ).populate('userId', 'name email');
		if (!driver) {
			return res.status(404).json({ error: error.message });
		}
		const rideId = await getActiveRide(req.user.user_Id);
		if (rideId && location) {
			const state = await getRideState(rideId) || {};
			await saveRideState(rideId, {
				...state,
				location,
				updatedAt: Date.now()
			});
		}

		// Available in real time
		const io = req.app.get('io');
        io.emit('driver:status-changed', {
            driverId: driver._id,
            userId: driver.userId._id,
			status: driver.available,
        });
        return res.status(200).json(driver);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
