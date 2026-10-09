const crypto = require('crypto');

const { userModel } = require('../../models/usersModel');
const { driverModel } = require('../../models/driversModel');
const { vehiclesModel } = require('../../models/vehiclesModel');
const { ridesModel } = require('../../models/ridesModel');

const { getRandomCesenaLocation } = require('./botLocationService');

const createBot = async () => {
    const botName = `Bot-${Date.now()}`;

    const user = await userModel.create({
        name: botName,
        email: `bot-${crypto.randomBytes(4).toString('hex')}@easyride.it`,
        salt: crypto.randomBytes(8).toString('hex'),
        hash: crypto.randomBytes(32).toString('hex'),
        role: 'driver'
    });
    const driver = await driverModel.create({
        userId: user._id,
        isBot: true,
        enabled: true,
        available: true,
        botName,
        location: getRandomCesenaLocation()
    });
    await vehiclesModel.create({
        driverId: driver._id,
        brand: 'Brand1',
        model: 'Model1',
        numberPlate: '11AAA11',
        color: 'Black',
        seatsAvailable: 4,
        type: 'lowcost'
    });
    return getBotById(driver._id);
};

const getBots = async () => {
    const bots = await driverModel
        .find({ isBot: true })
        .populate('userId', 'name email')
        .populate('vehicle');
    const activeDriverIds = await ridesModel.distinct('driverId', {
        status: { $nin: ['completed', 'cancelled'] }
    });
    const activeIds = new Set(activeDriverIds.map(String));
    return bots.map(bot => ({
        ...bot.toObject(),
        hasActiveRide: activeIds.has(String(bot._id))
    }));
};

const getBotById = async driverId => driverModel
    .findOne({ _id: driverId, isBot: true })
    .populate('userId', 'name email')
    .populate({
        path: 'vehicle',
        select: 'driverId brand model numberPlate color seatsAvailable type'
    });

const disableBot = async (driverId) => {
    const activeRide = await ridesModel.exists({
        driverId,
        status: { $nin: ['completed', 'cancelled'] }
    });
    if (activeRide) {
        throw new Error('Il bot ha una corsa attiva');
    }
    return driverModel.findOneAndUpdate(
        {
            _id: driverId,
            isBot: true
        },
        {
            $set: {
                enabled: false,
                available: false
            }
        },
        { new: true }
    );
};

const enableBot = async driverId => driverModel.findOneAndUpdate(
    { _id: driverId, isBot: true },
    { $set: { enabled: true, available: true } },
    { new: true }
).populate('userId', 'name email');

const disableAllBots = async () => {
    const activeDriverIds = await ridesModel.distinct('driverId', {
        status: { $nin: ['completed', 'cancelled'] }
    });

    return driverModel.updateMany(
        {
            isBot: true,
            enabled: { $ne: false },
            _id: { $nin: activeDriverIds }
        },
        {
            $set: {
                enabled: false,
                available: false
            }
        }
    );
};

module.exports = {
    createBot,
    getBots,
    getBotById,
    disableBot,
    enableBot,
    disableAllBots
};