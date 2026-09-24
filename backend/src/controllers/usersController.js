const { userModel } = require('../models/usersModel');
const { driverModel } = require('../models/driversModel');
const { vehiclesModel } = require('../models/vehiclesModel');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

//register user
exports.createUser = (req, res) => {
    const { name, email, password } = req.body;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const user = new userModel({
        name: name,
        email: email,
        salt: salt,
        hash: hash
    });

    user.save()
        .then(doc => {
            const token = jwt.sign({ user_Id: doc._id, email: doc.email, role: doc.role }, 'abcabcabc', { expiresIn: '24h' });
            res.status(201).json({ _id: doc._id, token: token, name: doc.name, email: doc.email, role: doc.role });
        })
        .catch(err => {
            res.status(500).send(err);
        });
} 

//register driver
exports.createDriver = async (req, res) => {
    try {
        const { name, email, password, brand, model, numberPlate, color } = req.body;

        const existingName = await userModel.findOne({ name: name });
        const existingEmail = await userModel.findOne({ email: email });
        if (existingName || existingEmail) {
            return res.status(409).json({
                message: 'Nome o email già utilizzati'
            });
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        const user = new userModel({
            name,
            email,
            salt,
            hash,
            role: 'driver'
        });
        await user.save();
        const driver = new driverModel({
            userId: user._id,
            status: 'unavailable'
        });
        await driver.save();
        const vehicle = new vehiclesModel({
            driverId: driver._id,
            brand,
            model,
            numberPlate,
            color
        });
        await vehicle.save();

        const token = jwt.sign({ user_Id: user._id, email: user.email, role: user.role }, 'abcabcabc', { expiresIn: '24h' });

        res.status(201).json({ _id: user._id, token: token, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json(err);
    }
}

//login
exports.verifyUser = (req, res) => {
    const { email, password } = req.body;
    userModel.findOne({ email: email })
        .then(doc => {
            if (!doc) {
                return res.status(404).send('User not found');
            }
            const hashToVerify = crypto.pbkdf2Sync(password, doc.salt, 1000, 64, 'sha512').toString('hex');
            if (hashToVerify !== doc.hash) {
                return res.status(401).send('Invalid password');
            }
            const token = jwt.sign({ user_Id: doc._id, email: doc.email, role: doc.role }, 'abcabcabc', { expiresIn: '24h' });
            res.status(200).json({ _id: doc._id, token: token, name: doc.name, email: doc.email, role: doc.role });
        })
        .catch(err => {
            res.status(500).send(err);
        });
}
