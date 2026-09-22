const { ridesModel } = require('../models/ridesModel');
const { driverModel } = require('../models/driversModel');

exports.createRide = async (req, res) => {
	try {
		const { driverId, pickup, dropoff, price } = req.body;
        const driver = await driverModel.findOne({
			_id: driverId,
			status: 'available'
		});
        if (!driver) {
			return res.status(409).json({ error: 'Driver non disponibile' });
		}
        const ride = await ridesModel.create({
			passengerId: req.user.user_Id,
			driverId,
			pickup: pickup,
			dropoff: dropoff,
			price
		});
        const createdRide = await populateRide(ridesModel.findById(ride._id));
		const io = req.app.get('io');
		io?.to(`driver:${driverId}`).emit('ride:request', createdRide);
		return res.status(201).json(createdRide);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.getRideById = async (req, res) => {
	try {
		const { id } = req.params;
        const ride = await populateRide(ridesModel.findById(id));
        if (!ride) {
			return res.status(404).json({ error: 'Corsa non trovata' });
		}
		return res.status(200).json(ride);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
}

const populateRide = query => query
	.populate('passengerId', 'name email')
	.populate({
		path: 'driverId',
		populate: { path: 'userId', select: 'name email' }
	});

exports.updateRideStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;
		const ride = await ridesModel.findById(id);
		if (!ride) {
			return res.status(404).json({ error: 'Corsa non trovata' });
		}
		ride.status = status;
		await ride.save();
		const updatedRide = await populateRide(ridesModel.findById(ride._id));
		const io = req.app.get('io');
		io?.to(`user:${ride.passengerId}`).emit('ride:status-changed', updatedRide);
		io?.to(`driver:${ride.driverId}`).emit('ride:status-changed', updatedRide);
		return res.status(200).json(updatedRide);;
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};
