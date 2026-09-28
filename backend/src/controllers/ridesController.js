const { ridesModel } = require('../models/ridesModel');
const { driverModel } = require('../models/driversModel');
const { spawn } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_KEY = 'abcabcabc';
const activeSimulations = new Map();
//const currentLocations = new Map();

const stopRideSimulation = rideId => {
	const simulation = activeSimulations.get(String(rideId));
	if (simulation) {
		simulation.kill();
		activeSimulations.delete(String(rideId));
		//currentLocations.delete(String(rideId));
	}
};

const startRideSimulation = (ride, userId, routes) => {
	stopRideSimulation(ride._id);

	const token = jwt.sign({ user_Id: userId }, JWT_KEY, { expiresIn: '1h' });
	const scriptPath = path.join(__dirname, '../../simulator/driver_simulator.py');
	const simulation = spawn(
		'python',
		[
			scriptPath,
			String(ride._id),
			token,
			'--step-seconds',
			'0.2'
		]
	);

	simulation.stdout.on('data', output => console.log(`[simulator] ${output}`));
	simulation.stderr.on('data', output => console.error(`[simulator] ${output}`));
	simulation.on('close', () => activeSimulations.delete(String(ride._id)));
	simulation.on('error', error => console.error('Errore simulatore:', error.message));
	simulation.stdin.write(JSON.stringify(routes || [[], []])); //invio route
	simulation.stdin.end();
	activeSimulations.set(String(ride._id), simulation);
};

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
		const { status, routes } = req.body;
		const ride = await ridesModel.findById(id);
		if (!ride) {
			return res.status(404).json({ error: 'Corsa non trovata' });
		}
		ride.status = status;
		await ride.save();
		if (status === 'in_progress') {
			startRideSimulation(ride, req.user.user_Id, routes);
		}
		if (status === 'completed' || status === 'cancelled') {
			stopRideSimulation(ride._id);
		}
		const updatedRide = await populateRide(ridesModel.findById(ride._id));
		const io = req.app.get('io');
		io?.to(`user:${ride.passengerId}`).emit('ride:status-changed', updatedRide);
		io?.to(`driver:${ride.driverId}`).emit('ride:status-changed', updatedRide);
		return res.status(200).json(updatedRide);;
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.updateRideLocation = async (req, res) => {
	try {
		const { id } = req.params;
		const { location } = req.body;
		const ride = await ridesModel.findById(id);

		//currentLocations.set(String(ride._id), location);
		req.app.get('io')?.to(`user:${ride.passengerId}`).emit('ride:location-changed', {
			location
		});
		return res.status(200).json({ rideId: ride._id, location });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};
