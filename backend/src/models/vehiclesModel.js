const mongoose = require('mongoose')

const VehicleSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    numberPlate: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    seatsAvailable: { type: Number, required: true, default: 4 }
});

const vehiclesModel = mongoose.model('Vehicles', VehicleSchema)

module.exports = { vehiclesModel }
