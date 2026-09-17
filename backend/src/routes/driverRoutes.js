const express = require('express');
const router = express.Router();
const controller = require('../controllers/driversController');

router.get('/available', controller.getAvailableDrivers);

module.exports = router;