const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { driverModel } = require('../models/driversModel');

const JWT_KEY = 'abcabcabc';

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: 'http://localhost:5173' }
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            socket.user = jwt.verify(token, JWT_KEY);
            next();
        } catch (error) {
            next(new Error('Token socket non valido'));
        }
    });

    io.on('connection', (socket) => {
        console.log('Socket connesso:', socket.id);
        socket.join(`user:${socket.user.user_Id}`);
        driverModel.findOne({ userId: socket.user.user_Id })
            .then(driver => {
                if (driver) {
                    socket.join(`driver:${driver._id}`);
                }
            })
            .catch(error => error.message);

        socket.on('disconnect', () => {
            console.log('Socket disconnesso:', socket.id);
        });
    });
    return io;
};

module.exports = { initializeSocket };