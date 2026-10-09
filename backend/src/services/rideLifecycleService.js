const { ridesModel } = require('../models/ridesModel');
const { driverModel } = require('../models/driversModel');

const {getRideState, saveRideState, clearActiveRide} = require('./rideStateService');
const { stop: stopSimulation } = require('./rideSimulationService');

const populateRide = query => query
    .populate('passengerId', 'name email')
    .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name email' }
    });

const updateRideState = async (rideId, changes) => {
    const state = await getRideState(rideId) || {};
    Object.assign(state, changes);
    await saveRideState(rideId, state);
    return state;
};

const rideResponse = (ride, state = {}) => ({
    ...ride.toObject(),
    ...state,
    driverLocation: state.location || null
});

const emitRideStatus = async (ride, io) => {
    const updatedRide = await populateRide(
        ridesModel.findById(ride._id)
    );
    if (!updatedRide) {
        throw new Error('Corsa non trovata');
    }

    const state = await updateRideState(ride._id, {
        rideId: String(ride._id),
        status: updatedRide.status,
        updatedAt: Date.now()
    });
    if (io) {
        const statusPayload = {
            ...updatedRide.toObject(),
            driverLocation: state.location || null
        };
        io.to(`user:${ride.passengerId}`).emit('ride:status-changed', statusPayload);
        io.to(`driver:${ride.driverId}`).emit('ride:status-changed', statusPayload);
    }

    return rideResponse(updatedRide, state);
};

const setRideStatus = async (rideOrId, status, io) => {
    const ride = typeof rideOrId === 'object'
        ? rideOrId
        : await ridesModel.findById(rideOrId);
    if (!ride) {
        throw new Error('Corsa non trovata');
    }

    const driver = await driverModel
        .findById(ride.driverId)
        .select('userId location isBot');

    ride.status = status;
    await ride.save();
    const stateChanges = {
        rideId: String(ride._id),
        status,
        updatedAt: Date.now()
    };

    if (status === 'accepted' && driver?.location) {
        stateChanges.location = driver.location;
    }
    await updateRideState(ride._id, stateChanges);

    if (status === 'completed' || status === 'cancelled') {
        stopSimulation(ride._id);
        const state = await getRideState(ride._id) || {};
        await clearActiveRide([
            state.passengerId,
            state.driverUserId,
            String(ride.passengerId),
            driver?.userId
        ]);

        if (driver?.isBot) {
            await driverModel.findByIdAndUpdate(driver._id, {
                $set: { available: true }
            });
        }
    }
    return emitRideStatus(ride, io);
};

const emitRideLocation = (ride, location, io) => {
    if (!io) {
        return;
    }
    io.to(`user:${ride.passengerId}`).emit('ride:location-changed', { location });
    io.to(`driver:${ride.driverId}`).emit('ride:location-changed', { location });
};

const updateRideLocation = async (ride, location, io) => {
    const state = await getRideState(ride._id) || {};
    const routeIndex = Array.isArray(state.route)
        ? state.route.findIndex(point => `${point[0]},${point[1]}` === location)
        : -1;

    await updateRideState(ride._id, {
        rideId: String(ride._id),
        location,
        routeIndex: routeIndex >= 0 ? routeIndex + 1 : state.routeIndex || 0,
        updatedAt: Date.now()
    });
    emitRideLocation(ride, location, io);
    return { rideId: ride._id, location };
};

module.exports = {
    setRideStatus,
    emitRideStatus,
    emitRideLocation,
    populateRide,
    updateRideState,
    updateRideLocation,
    rideResponse
};