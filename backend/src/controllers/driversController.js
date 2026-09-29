const { driverModel } = require('../models/driversModel');
const { vehiclesModel } = require('../models/vehiclesModel');

exports.getAvailableDrivers = async (req, res) => {
	try {
		const drivers = await driverModel
			.find({ available: true })
			.populate('userId', 'name email')

		const driverId = drivers.map(driver => driver._id);
		const vehicles = await vehiclesModel
			.find({ driverId: { $in: driverId } })
			.select('driverId brand model seatsAvailable')

		const response = drivers.map(driver => {
			return {
				_id: driver._id,
				userId: driver.userId,
				available: driver.available,
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
		return res.status(200).json({ available: driver.available });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.setDriverAvailable = async (req, res) => {
    try {
		const { av } = req.body;
        const driver = await driverModel.findOneAndUpdate(
            { userId: req.user.user_Id },
			{ available: av },
            { new: true }
        ).populate('userId', 'name email');
		if (!driver) {
			return res.status(404).json({ error: error.message });
		}

		// Available in real time
		const io = req.app.get('io');
        io.emit('driver:status-changed', {
            driverId: driver._id,
            userId: driver.userId._id,
			status: driver.status
        });
        return res.status(200).json(driver);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
