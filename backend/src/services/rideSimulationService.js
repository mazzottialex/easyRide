const { ridesModel } = require('../models/ridesModel');
const { getRideState, getActiveRide, saveRideState} = require('./rideStateService');

const simulations = new Map();

const updateState = async (rideId, changes) => {
    const state = await getRideState(rideId) || {};
    Object.assign(state, changes);
    await saveRideState(rideId, state);
    return state;
};

const start = async (ride, route, finalStatus, onComplete, onLocation) => {
    const rideId = String(ride._id);
    if (simulations.has(rideId)) {
        return;
    }
    const savedState = await getRideState(rideId) || {};
    const hasNewRoute = Boolean(route && route.length);
    const simulationRoute = hasNewRoute ? route : savedState.route;
    if (!simulationRoute || !simulationRoute.length) {
        return;
    }
    const startIndex = hasNewRoute
        ? 0
        : Math.min(savedState.routeIndex || 0, simulationRoute.length - 1);
    await updateState(rideId, {
        route: simulationRoute,
        routeIndex: startIndex,
        statusAfterSimulation: finalStatus,
        paused: false,
        updatedAt: Date.now()
    });

    const simulation = { paused: false, timer: null };
    simulations.set(rideId, simulation);
    const advance = async index => {
        if (simulations.get(rideId) !== simulation) {
            return;
        }
        if (simulation.paused) {
            return;
        }
        const coordinate = simulationRoute[index];
        const state = await getRideState(rideId) || {};
        await updateState(rideId, {
            ...state,
            location: `${coordinate[0]},${coordinate[1]}`,
            routeIndex: index + 1,
            updatedAt: Date.now()
        });
        if (onLocation) {
            await onLocation(ride, `${coordinate[0]},${coordinate[1]}`);
        }
        if (index + 1 < simulationRoute.length) {
            simulation.timer = setTimeout(() => advance(index + 1), 10);
            return;
        }
        simulations.delete(rideId);
        const currentRide = await ridesModel.findById(rideId);
        if (!currentRide || ['cancelled', 'completed'].includes(currentRide.status)) {
            return;
        }
        currentRide.status = finalStatus;
        await currentRide.save();
        await onComplete(currentRide);
    };
    advance(startIndex).catch(error => {
        simulations.delete(rideId);
        console.error('Errore simulatore:', error.message);
    });
};

const stop = rideId => {
    const simulation = simulations.get(String(rideId));
    if (simulation) {
        clearTimeout(simulation.timer);
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
    clearTimeout(simulation.timer);
    simulations.delete(String(rideId));
    await updateState(rideId, { paused: true, updatedAt: Date.now() });
};

const resumeForUser = async (userId, onComplete, onLocation) => {
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
        null,
        state.statusAfterSimulation,
        onComplete,
        onLocation
    );
};

module.exports = {
    start,
    stop,
    pauseForUser,
    resumeForUser
};
