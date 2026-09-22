const express = require('express');
const router = express.Router();
const controller = require('../controllers/ridesController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/', authenticate, controller.createRide);
router.get('/:id', authenticate, controller.getRideById);
router.patch('/:id/status', authenticate, controller.updateRideStatus);

module.exports = router;
