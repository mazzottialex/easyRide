const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const botService = require('../services/bot/botService');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');

router.use(authenticate, requireAdmin);

router.get('/users', controller.getUsers);
router.get('/drivers', controller.getDrivers);
router.get('/rides', controller.getRides);
router.get('/pricing', controller.getPricing);
router.put('/pricing', controller.updatePricing);

router.get('/bots', botService.getBots);
router.post('/bots', botService.createBot);
router.delete('/bots/:id', botService.deleteBot);
router.delete('/bots', botService.deleteAllBots);

module.exports = router;
