const express = require('express');
const router = express.Router();
const controller = require('../controllers/driversController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/available', authenticate, controller.getAvailableDrivers);
router.get('/status', authenticate, controller.getDriverStatus);
router.patch('/status', authenticate, controller.setDriverStatus);

module.exports = router;