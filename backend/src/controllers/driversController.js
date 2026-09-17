const { driverModel } = require('../models/driversModel');

exports.getAvailableDrivers = async (req, res) => {
	try {
		const drivers = await driverModel
			.find({ status: 'available' })
			.populate('userId', 'name email')
		res.status(200).json(drivers);
	} catch (error) {
		res.status(500).json({
            error: error.message
        })
	}
};
