const { spawn } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');
const { ridesModel } = require('../models/ridesModel');
const { getRideState, getActiveRide, saveRideState} = require('./rideStateService');

const JWT_KEY = 'abcabcabc';
const simulations = new Map();

const updateState = async (rideId, changes) => {
    const state = await getRideState(rideId) || {};
    Object.assign(state, changes);
    await saveRideState(rideId, state);
    return state;
};

const start = async (ride, userId, route, finalStatus, onComplete) => {
    const rideId = String(ride._id);
    if (simulations.has(rideId)) {
        return;
    }
    const savedState = await getRideState(rideId) || {};
    const simulationRoute = route && route.length ? route : savedState.route;
    const startIndex = savedState.routeIndex || 0;
    if (!simulationRoute || !simulationRoute.length) {
        return;
    }
    await updateState(rideId, {
        route: simulationRoute,
        routeIndex: startIndex,
        statusAfterSimulation: finalStatus,
        paused: false,
        updatedAt: Date.now()
    });

    const token = jwt.sign({ user_Id: userId }, JWT_KEY, { expiresIn: '1h' });
    const script = path.join(__dirname, '../../simulator/driver_simulator.py');
    const process = spawn('python', [
        script,
        rideId,
        token,
        '--step-seconds',
        '0.01',
        '--start-index',
        String(startIndex)
    ]);
    const simulation = { process, paused: false };
    simulations.set(rideId, simulation);

    process.stdout.on('data', output => console.log(`[simulator] ${output}`));
    process.stderr.on('data', output => console.error(`[simulator] ${output}`));
    process.on('error', error => {
        simulations.delete(rideId);
        console.error('Errore simulatore:', error.message);
    });
    process.on('close', async () => {
        if (simulations.get(rideId) !== simulation) {
            return;
        }
        simulations.delete(rideId);

        const currentRide = await ridesModel.findById(rideId);
        if (
            !currentRide ||
            simulation.paused ||
            ['cancelled', 'completed'].includes(currentRide.status)
        ) {
            return;
        }
        currentRide.status = finalStatus;
        await currentRide.save();
        await onComplete(currentRide);
    });

    process.stdin.write(JSON.stringify(simulationRoute));
    process.stdin.end();
};

const stop = rideId => {
    const simulation = simulations.get(String(rideId));
    if (simulation) {
        simulation.process.kill();
        simulations.delete(String(rideId));
    }
};

const pauseForUser = async userId => {
    const rideId = await getActiveRide(userId);
    const simulation = rideId && simulations.get(String(rideId));
    if (!simulation) {
        return;
    }
    simulation.paused = true;
    simulation.process.kill();
    simulations.delete(String(rideId));
    await updateState(rideId, { paused: true, updatedAt: Date.now() });
};

const resumeForUser = async (userId, onComplete) => {
    const rideId = await getActiveRide(userId);
    if (!rideId || simulations.has(String(rideId))) {
        return;
    }

    const state = await getRideState(rideId);
    const ride = await ridesModel.findById(rideId);
    if ( !ride || !state || !state.paused || ['completed', 'cancelled'].includes(ride.status)) {
        return;
    }
    await start(
        ride,
        state.driverUserId || userId,
        state.route,
        state.statusAfterSimulation,
        onComplete
    );
};

module.exports = {
    start,
    stop,
    pauseForUser,
    resumeForUser
};
