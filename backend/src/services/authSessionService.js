const crypto = require('crypto');
const { redisClient } = require('./redisClient');

const SESSION_COOKIE = 'easyride.sid';
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 86400);
const createSession = async (user) => {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session = {
        ...user,
        user_Id: String(user.user_Id || user._id)
    };
    await redisClient.set(`session:${sessionId}`, JSON.stringify(session), {
        EX: SESSION_TTL_SECONDS
    });
    return sessionId;
};

const getSession = async (sessionId) => {
    if (!sessionId) {
        return null;
    }
    const session = await redisClient.get(`session:${sessionId}`);
    return session ? JSON.parse(session) : null;
};

const destroySession = async (sessionId) => {
    if (sessionId) {
        await redisClient.del(`session:${sessionId}`);
    }
};

const parseCookies = (cookieHeader = '') => Object.fromEntries(
    cookieHeader.split(';').filter(Boolean).map((cookie) => {
        const separator = cookie.indexOf('=');
        const name = separator >= 0 ? cookie.slice(0, separator).trim() : cookie.trim();
        const value = separator >= 0 ? cookie.slice(separator + 1).trim() : '';
        return [name, decodeURIComponent(value)];
    })
);

const sessionCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_SECONDS * 1000,
    path: '/'
};

module.exports = {
    SESSION_COOKIE,
    createSession,
    getSession,
    destroySession,
    parseCookies,
    sessionCookieOptions
};
