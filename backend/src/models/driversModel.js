const mongoose = require('mongoose')

const DriverSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    status: { type: String, enum: ['available', 'unavailable'], default: 'available' }
});

const driverModel = mongoose.model('Driver', DriverSchema)

module.exports = { driverModel }
