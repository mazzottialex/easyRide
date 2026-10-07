const { redisClient } = require('./redisClient');

const rideStateKey = rideId => `ride:state:${rideId}`;
const activeRideKey = userId => `ride:active:${userId}`;
const presenceKey = userId => `ride:presence:${userId}`;
const stateTtl = Number(process.env.RIDE_STATE_TTL_SECONDS || 86400);

const saveRideState = async (rideId, state) => {
    await redisClient.set(rideStateKey(rideId), JSON.stringify(state), {
        EX: stateTtl
    });
};

const getRideState = async rideId => {
    const state = await redisClient.get(rideStateKey(rideId));
    return state ? JSON.parse(state) : null;
};

const setActiveRide = async (userId, rideId) => {
    if (userId) {
        await redisClient.set(activeRideKey(userId), String(rideId), {
            EX: stateTtl
        });
    }
};

const getActiveRide = userId => userId
    ? redisClient.get(activeRideKey(userId))
    : null;

const clearActiveRide = async (userIds = []) => {
    const keys = userIds.filter(Boolean).map(activeRideKey);
    if (keys.length) {
        await redisClient.del(keys);
    }
};

const setRidePresence = async (userId, connected) => {
    if (userId) {
        await redisClient.set(presenceKey(userId), connected ? '1' : '0', {
            EX: connected ? 30 : 10
        });
    }
};

const isRideUserConnected = async userId => (
    userId ? (await redisClient.get(presenceKey(userId))) === '1' : false
);

module.exports = {
    saveRideState,
    getRideState,
    setActiveRide,
    getActiveRide,
    clearActiveRide,
    setRidePresence,
    isRideUserConnected
};
