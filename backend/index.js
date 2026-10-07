const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./src/routes/userRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const rideRoutes = require('./src/routes/rideRoutes');
const routingRoutes = require('./src/routes/routingRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const cors = require('cors');
const http = require('http');
const { initializeSocket } = require('./src/socket/socketHandler');
const { connectSessionStore } = require('./src/services/sessionStore');

mongoose.connect('mongodb://localhost:27017/easyride')
  .then(() => console.log('MongoDB connected to easyride'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);

const server = http.createServer(app);
const io = initializeSocket(server);
app.set('io', io);

const startServer = async () => {
  await connectSessionStore();
  server.listen(3000, () => {
      console.log('Server listening on port 3000');
  });
};

startServer().catch((error) => {
  console.error('Unable to start session store:', error.message);
  process.exit(1);
});
