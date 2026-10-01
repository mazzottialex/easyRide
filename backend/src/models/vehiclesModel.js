const mongoose = require('mongoose')

const VehicleSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    numberPlate: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    seatsAvailable: { type: Number, enum: [4, 8], required: true, default: 4 },
    type: { type: String, enum: ['lowcost', 'standard', 'premium'], required: true, default: 'standard' }
});

const vehiclesModel = mongoose.model('Vehicles', VehicleSchema)

module.exports = { vehiclesModel }
