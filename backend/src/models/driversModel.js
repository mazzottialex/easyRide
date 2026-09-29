const mongoose = require('mongoose')

const DriverSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    available: { type: Boolean, default: false }
});

const driverModel = mongoose.model('Driver', DriverSchema)

module.exports = { driverModel }
