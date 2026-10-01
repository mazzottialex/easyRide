const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Accesso riservato all\'admin' });
    }
    next();
};

module.exports = { requireAdmin };
