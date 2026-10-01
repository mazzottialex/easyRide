const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
    basePrice: { type: Number, default: 3},
    ridePerKm: { type: Number, default: 1.2},
    pickupPerKm: { type: Number, default: 0.4},
    ridePerMinute: { type: Number, default: 0.1},
    pickupPerMinute: { type: Number, default: 0.05},
    vehicleMultipliers: {
        lowcost: { type: Number, default: 0.85},
        standard: { type: Number, default: 1},
        premium: { type: Number, default: 1.4}
    },
    seatMultipliers: {
        four: { type: Number, default: 1},
        eight: { type: Number, default: 1.2}
    }
}, { timestamps: true });

const pricingModel = mongoose.model('Pricing', PricingSchema);
module.exports = { pricingModel };
