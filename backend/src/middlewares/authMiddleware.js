const jwt = require('jsonwebtoken');
const {
    SESSION_COOKIE,
    getSession,
    parseCookies
} = require('../services/authSessionService');
const JWT_SECRET = 'abcabcabc';

const authenticate = async (req, res, next) => {
    const cookies = parseCookies(req.headers.cookie);
    const sessionUser = await getSession(cookies[SESSION_COOKIE]);
    if (sessionUser) {
        req.user = sessionUser;
        return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Token mancante'
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token non valido'
        });
    }
};

module.exports = { authenticate };