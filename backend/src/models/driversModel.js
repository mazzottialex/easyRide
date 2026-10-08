const mongoose = require('mongoose')

const DriverSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    available: { type: Boolean, default: false },
    location: { type: String, default: null },
    isBot: { type: Boolean, default: false},
    enabled: { type: Boolean, default: true, index: true},
    botName: { type: String, default: null}
});

const driverModel = mongoose.model('Driver', DriverSchema)

module.exports = { driverModel }
