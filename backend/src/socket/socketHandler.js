const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { driverModel } = require('../models/driversModel');
const { ridesModel } = require('../models/ridesModel');
const {SESSION_COOKIE, getSession, parseCookies} = require('../services/authSessionService');
const { getRideState, saveRideState, setRidePresence, getActiveRide } = require('../services/rideStateService');
const { pauseRideForUser, resumeRideForUser } = require('../controllers/ridesController');

const JWT_KEY = 'abcabcabc';

const setDriverOffline = async (io, socket) => {
    try {
        const driver = socket.driverId
            ? await driverModel.findById(socket.driverId)
            : await driverModel.findOne({ userId: socket.user.user_Id });
        if (!driver) {
            return;
        }
        const activeRideId = await getActiveRide(socket.user.user_Id);
        if (activeRideId) {
            return;
        }

        const connectedSockets = await io.in(`driver:${driver._id}`).fetchSockets();

        if (connectedSockets.length > 1) {
            return;
        }

        driver.available = false;
        driver.location = null;
        await driver.save();

        io.emit('driver:status-changed', {
            driverId: driver._id,
            userId: driver.userId,
            status: false
        });
    } catch (error) {
        console.error('Errore disconnessione:', error.message);
    }
};

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: 'http://localhost:5173', credentials: true }
    });

    io.use(async (socket, next) => {
        try {
            const cookies = parseCookies(socket.handshake.headers.cookie);
            const sessionUser = await getSession(cookies[SESSION_COOKIE]);
            if (sessionUser) {
                socket.user = sessionUser;
            } else {
                const token = socket.handshake.auth?.token;
                socket.user = jwt.verify(token, JWT_KEY);
            }
            next();
        } catch (error) {
            next(new Error('Token socket non valido'));
        }
    });

    io.on('connection', async (socket) => {
        console.log('Socket connesso:', socket.id);
        const driver = await driverModel.findOne({ userId: socket.user.user_Id });
        if (driver) {
            socket.driverId = driver._id.toString();
            socket.join(`driver:${driver._id}`);
        }
        socket.join(`user:${socket.user.user_Id}`);
        await setRidePresence(socket.user.user_Id, true);
        await resumeRideForUser(socket.user.user_Id, io);
        const presenceHeartbeat = setInterval(
            () => setRidePresence(socket.user.user_Id, true),
            10000
        );

        socket.on('disconnecting', async () => {
            console.log('Socket disconnesso:', socket.id);
            clearInterval(presenceHeartbeat);
            await setDriverOffline(io, socket);
            setTimeout(async () => {
                const sockets = await io.in(`user:${socket.user.user_Id}`).fetchSockets();
                if (sockets.length === 0) {
                    await setRidePresence(socket.user.user_Id, false);
                    await pauseRideForUser(socket.user.user_Id);
                }
            }, 1500);
        });

        socket.on('driver:location', async ({ rideId, location }) => {
            const ride = await ridesModel.findById(rideId);
            const driver = await driverModel.findOne({ userId: socket.user.user_Id });
            if (!ride || !driver) {
                return;
            }
            const state = await getRideState(rideId) || {};
            await saveRideState(rideId, { ...state, rideId: String(rideId), location, updatedAt: Date.now() });
            io.to(`user:${ride.passengerId}`).emit('ride:location-changed', { location });
        });
    });
    return io;
};

module.exports = { initializeSocket };