const { ridesModel } = require('../models/ridesModel');
const { driverModel } = require('../models/driversModel');
const {
	saveRideState,
	getRideState,
	setActiveRide,
	getActiveRide,
	clearActiveRide,
	isRideUserConnected
} = require('../services/rideStateService');
const {
	start: startSimulation,
	stop: stopSimulation,
	pauseForUser,
	resumeForUser
} = require('../services/rideSimulationService');

const updateRideState = async (rideId, changes) => {
	const state = await getRideState(rideId) || {};
	Object.assign(state, changes);
	await saveRideState(rideId, state);
	return state;
};

const rideResponse = (ride, state) => Object.assign(
	{},
	ride.toObject(),
	state || {},
	{ driverLocation: state && state.location || null }
);

const emitRideStatus = async (ride, io) => {
	const updatedRide = await populateRide(ridesModel.findById(ride._id));
	await updateRideState(ride._id, {
		rideId: String(ride._id),
		status: updatedRide.status,
		updatedAt: Date.now()
	});
	if (io) {
		io.to(`user:${ride.passengerId}`).emit('ride:status-changed', updatedRide);
		io.to(`driver:${ride.driverId}`).emit('ride:status-changed', updatedRide);
	}
	return updatedRide;
};

exports.createRide = async (req, res) => {
	try {
		const { driverId, pickup, dropoff, price } = req.body;
        const availableDriver = await driverModel.findOne({
			_id: driverId,
			available: true
		});
        if (!availableDriver) {
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
		const driverUser = await driverModel.findById(ride.driverId).select('userId');
		await saveRideState(ride._id, {
			rideId: String(ride._id),
			passengerId: String(ride.passengerId),
			driverId: String(ride.driverId),
			driverUserId: driverUser && driverUser.userId ? String(driverUser.userId) : null,
			status: ride.status,
			location: null,
			routeIndex: 0,
			paused: false,
			updatedAt: Date.now()
		});
		await setActiveRide(req.user.user_Id, ride._id);
		await setActiveRide(driverUser && driverUser.userId, ride._id);
		const io = req.app.get('io');
		if (io) {
			io.to(`driver:${driverId}`).emit('ride:request', createdRide);
		}
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
		const state = await getRideState(id);
		return res.status(200).json(rideResponse(ride, state));
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
		const state = await getRideState(id) || {};
		const passengerId = state.passengerId || String(ride.passengerId);
		const driver = await driverModel.findById(ride.driverId).select('userId');
		const driverUserId = state.driverUserId || String(driver && driver.userId || '');
		if (
			status !== 'cancelled' &&
			status !== 'completed' &&
			(!await isRideUserConnected(passengerId) || !await isRideUserConnected(driverUserId))
		) {
			return res.status(409).json({
				error: 'Entrambi gli utenti devono essere connessi per continuare la corsa'
			});
		}
		ride.status = status;
		await ride.save();
		await updateRideState(id, { rideId: id, status, updatedAt: Date.now() });
		if (status === 'completed' || status === 'cancelled') {
			stopSimulation(ride._id);
			await clearActiveRide([state.passengerId, state.driverUserId, ride.passengerId, req.user.user_Id]);
		}
		const io = req.app.get('io');
		const updatedRide = await emitRideStatus(ride, io);
		
		return res.status(200).json(updatedRide);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.startRideRoute = async (req, res) => {
	try {
		const { id } = req.params;
		const { route, statusAfterSimulation } = req.body;
		const ride = await ridesModel.findById(id);

		await startSimulation(
			ride,
			req.user.user_Id,
			route,
			statusAfterSimulation,
			currentRide => emitRideStatus(currentRide, req.app.get('io'))
		);
		return res.status(202).json({ message: 'Simulazione avviata' });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.updateRideLocation = async (req, res) => {
	try {
		const { id } = req.params;
		const { location } = req.body;
		const ride = await ridesModel.findById(id);
		if (!ride) {
			return res.status(404).json({ error: 'Corsa non trovata' });
		}
		const state = await getRideState(id) || {};
		const routeIndex = Array.isArray(state.route)
			? state.route.findIndex(point => `${point[0]},${point[1]}` === location)
			: -1;
		await updateRideState(id, {
			rideId: id,
			location,
			routeIndex: routeIndex >= 0 ? routeIndex + 1 : state.routeIndex || 0,
			updatedAt: Date.now()
		});

		const io = req.app.get('io');
		if (io) {
			io.to(`driver:${ride.driverId}`).emit('ride:location-changed', location);
		}
		return res.status(200).json({ rideId: ride._id, location });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.getActiveRide = async (req, res) => {
	try {
		const rideId = await getActiveRide(req.user.user_Id);
		if (!rideId) {
			return res.status(204).send();
		}
		const ride = await populateRide(ridesModel.findById(rideId));
		if (!ride || ['completed', 'cancelled'].includes(ride.status)) {
			await clearActiveRide([req.user.user_Id]);
			return res.status(204).send();
		}
		const state = await getRideState(rideId);
		return res.status(200).json(rideResponse(ride, state));
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.pauseRideForUser = pauseForUser;
exports.resumeRideForUser = (userId, io) => resumeForUser(
	userId,
	ride => emitRideStatus(ride, io)
);

exports.getRideHistory = async (req, res) => {
	try {
		const {status} = req.query;
		const filter = {};
		if (status) {
			filter.status = status;
		}
		if (req.user.role === 'driver') {
			const driver = await driverModel
				.findOne({ userId: req.user.user_Id })
				.select('_id');
			if (!driver) {
				return res.status(404).json({
					error: 'Driver non trovato'
				});
			}
			filter.driverId = driver._id;
		} else
			filter.passengerId = req.user.user_Id;

		const rides = await populateRide(
			ridesModel
				.find(filter)
				.sort({ dateTime: -1 }) // sort per ordine temporale
		);
		return res.status(200).json({
			rides
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message
		});
	}
};
