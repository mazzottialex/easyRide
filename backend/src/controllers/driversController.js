const { driverModel } = require('../models/driversModel');
const { vehiclesModel } = require('../models/vehiclesModel');

exports.getAvailableDrivers = async (req, res) => {
	try {
		const drivers = await driverModel
			.find({ status: 'available' })
			.populate('userId', 'name email')

		const driverId = drivers.map(driver => driver._id);
		const vehicles = await vehiclesModel
			.find({ driverId: { $in: driverId } })
			.select('driverId brand model seatsAvailable')

		const response = drivers.map(driver => {
			return {
				_id: driver._id,
				userId: driver.userId,
				status: driver.status,
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
		return res.status(200).json({ status: driver.status });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.setDriverStatus = async (req, res) => {
    try {
		const { status } = req.body;
        const driver = await driverModel.findOneAndUpdate(
            { userId: req.user.user_Id },
			{ status: status },
            { new: true }
        ).populate('userId', 'name email');
		if (!driver) {
			return res.status(404).json({ error: error.message });
		}

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
