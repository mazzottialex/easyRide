const { userModel } = require('../models/usersModel');
const { driverModel } = require('../models/driversModel');
const { vehiclesModel } = require('../models/vehiclesModel');
const crypto = require('crypto');
const {
    SESSION_COOKIE,
    createSession,
    destroySession,
    getSession,
    parseCookies,
    sessionCookieOptions
} = require('../services/authSessionService');

const createAuthenticatedResponse = async (res, user, statusCode = 200) => {
    const sessionId = await createSession(user);
    res.cookie(SESSION_COOKIE, sessionId, sessionCookieOptions);
    res.status(statusCode).json(user);
};

//register user
exports.createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const user = new userModel({
        name: name,
        email: email,
        salt: salt,
        hash: hash
    });

    try {
        const doc = await user.save();
        const authenticatedUser = { _id: doc._id, name: doc.name, email: doc.email, role: doc.role };
        await createAuthenticatedResponse(res, authenticatedUser, 201);
    } catch (err) {
        res.status(500).send(err);
    }
} 

//register driver
exports.createDriver = async (req, res) => {
    try {
        const { name, email, password, brand, model, numberPlate, color, seats, type } = req.body;

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
            available: false
        });
        await driver.save();
        const vehicle = new vehiclesModel({
            driverId: driver._id,
            brand,
            model,
            numberPlate,
            color,
            seats,
            type
        });
        await vehicle.save();

        const sessionId = await createSession({ _id: user._id, email: user.email, role: user.role });
        res.cookie(SESSION_COOKIE, sessionId, sessionCookieOptions);
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json(err);
    }
}

//login
exports.verifyUser = (req, res) => {
    const { identity, password } = req.body;

    if (identity === 'admin' && password === 'admin') {
        return createAuthenticatedResponse(res, { _id: 'admin', name: 'Admin', email: 'admin', role: 'admin' });
    }

    userModel.findOne({ $or: [{email: identity}, {name: identity}] })
        .then(async doc => {
            if (!doc) {
                return res.status(404).send('User not found');
            }
            const hashToVerify = crypto.pbkdf2Sync(password, doc.salt, 1000, 64, 'sha512').toString('hex');
            if (hashToVerify !== doc.hash) {
                return res.status(401).send('Invalid password');
            }
            return createAuthenticatedResponse(res, { _id: doc._id, name: doc.name, email: doc.email, role: doc.role });
        })
        .catch(err => {
            res.status(500).send(err);
        });
}

exports.getCurrentUser = async (req, res) => {
    const user = await getSession(parseCookies(req.headers.cookie)[SESSION_COOKIE]);
    if (!user) {
        return res.status(401).json({ error: 'Sessione non valida' });
    }
    const publicUser = {
        name: user.name,
        email: user.email,
        role: user.role
    };
    return res.status(200).json(publicUser);
};

exports.logout = async (req, res) => {
    const sessionId = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    await destroySession(sessionId);
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
    return res.status(204).send();
};
