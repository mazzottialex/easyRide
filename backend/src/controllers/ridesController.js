const { ridesModel } = require('../models/ridesModel');
const { driverModel } = require('../models/driversModel');
const {
	getRideState,
	setActiveRide,
	getActiveRide,
	clearActiveRide,
	isRideUserConnected
} = require('../services/rideStateService');
const {
	start: startSimulation,
	pauseForUser,
	resumeForUser
} = require('../services/rideSimulationService');

const {
    setRideStatus,
    emitRideStatus,
    emitRideLocation,
    populateRide,
    updateRideState,
    updateRideLocation,
    rideResponse
} = require('../services/rideLifecycleService');

exports.createRide = async (req, res) => {
	try {
		const { driverId, pickup, dropoff, price } = req.body;
		let availableDriver = await driverModel.findOne({
			_id: driverId,
			available: true,
			enabled: { $ne: false }
		});
        if (!availableDriver) {
			return res.status(409).json({ error: 'Driver non disponibile' });
		}
		if (availableDriver.isBot) {
			availableDriver = await driverModel.findOneAndUpdate(
				{
					_id: driverId,
					available: true,
					enabled: { $ne: false },
					isBot: true
				},
				{
					$set: {available: false}
				},
				{
					new: true
				}
			);
			if (!availableDriver) {
				return res.status(409).json({
					error: 'Bot non disponibile'
				});
			}
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
		await updateRideState(ride._id, {
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
		if (availableDriver.isBot) {
			setRideStatus(ride, 'accepted', io).catch(error => {
				console.error('Errore accettazione corsa bot:', error.message);
			});
		} else if (io) {
			// driver reale
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


const isSocketUserConnected = async (io, userId) => {
	if (!io || !userId){
		return false;
	}
	const sockets = await io.in(`user:${userId}`).fetchSockets();
	return sockets.length > 0;
};

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
		const driver = await driverModel.findById(ride.driverId).select('userId location isBot');
		const driverUserId = state.driverUserId || String(driver && driver.userId || '');
		const io = req.app.get('io');
		const passengerConnected = await isSocketUserConnected(io, passengerId)
			|| await isRideUserConnected(passengerId);
		const driverConnected = await isSocketUserConnected(io, driverUserId)
			|| await isRideUserConnected(driverUserId);
		if (
			status !== 'cancelled' &&
			status !== 'completed' &&
			(!passengerConnected || !driverConnected)
		) {
			return res.status(409).json({
				error: 'Entrambi gli utenti devono essere connessi per continuare la corsa'
			});
		}
		const updatedRide = await setRideStatus(ride, status, io);
		
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
		if (!ride) {
			return res.status(404).json({ error: 'Corsa non trovata' });
		}
		const io = req.app.get('io');

		await startSimulation(
			ride,
			route,
			statusAfterSimulation,
			currentRide => emitRideStatus(currentRide, io),
			(currentRide, location) => emitRideLocation(
				currentRide,
				location,
				io
			)
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
		const io = req.app.get('io');
		return res.status(200).json(await updateRideLocation(ride, location, io));
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
	ride => emitRideStatus(ride, io),
	(ride, location) => emitRideLocation(ride, location, io)
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
