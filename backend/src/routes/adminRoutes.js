const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');

router.use(authenticate, requireAdmin);

router.get('/users', controller.getUsers);
router.get('/drivers', controller.getDrivers);
router.get('/rides', controller.getRides);
router.get('/pricing', controller.getPricing);
router.put('/pricing', controller.updatePricing);

router.get('/bots', controller.getBots);
router.post('/bots', controller.createBot);
router.delete('/bots/:id', controller.deleteBot);
router.delete('/bots', controller.deleteAllBots);

module.exports = router;
