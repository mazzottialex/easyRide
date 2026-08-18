const { userModel } = require('../models/usersModel');
const { vehiclesModel: vehicleModel } = require('../models/vehiclesModel');
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
            res.status(201).json({ token: token, name: doc.name, email: doc.email, role: doc.role });
        })
        .catch(err => {
            res.status(500).send(err);
        });
} 

//register driver
exports.createDriver = async (req, res) => {
    try {
        const { name, email, password, brand, model, numberPlate, color } = req.body;
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        const user = new userModel({
            name,
            email,
            salt,
            hash,
            role: 'driver'
        });
        const driver = await user.save();
        const vehicle = new vehicleModel({
            driverId: driver._id,
            brand,
            model,
            numberPlate,
            color
        });
        await vehicle.save();

        const token = jwt.sign({ user_Id: driver._id, email: driver.email, role: driver.role }, 'abcabcabc', { expiresIn: '24h' });

        res.status(201).json({ token: token, name: driver.name, email: driver.email, role: driver.role });
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
            res.status(200).json({ token: token, name: doc.name, email: doc.email, role: doc.role });
        })
        .catch(err => {
            res.status(500).send(err);
        });
}
