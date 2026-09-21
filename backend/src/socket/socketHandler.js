const { Server } = require('socket.io');

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: 'http://localhost:5173' }
    });
    io.on('connection', (socket) => {
        console.log('Socket connesso:', socket.id);
        socket.on('disconnect', () => {
            console.log('Socket disconnesso:', socket.id);
        });
    });
    return io;
};

module.exports = { initializeSocket };