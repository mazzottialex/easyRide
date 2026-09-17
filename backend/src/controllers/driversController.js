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
