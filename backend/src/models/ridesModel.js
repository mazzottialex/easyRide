const mongoose = require('mongoose')

const RideSchema = new mongoose.Schema({
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'], default: 'pending'},
    price: { type: Number, required: true },
    dateTime: { type: Date, required: true, default: Date.now }
});

const ridesModel = mongoose.model('Rides', RideSchema)

module.exports = { ridesModel }