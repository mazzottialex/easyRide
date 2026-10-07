const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');
const { authenticate } = require('../middlewares/authMiddleware');

router.route('/register')
    .post(controller.createUser)

router.route('/register-driver')
    .post(controller.createDriver)

router.route('/verify')
    .post(controller.verifyUser)

router.route('/me')
    .get(authenticate, controller.getCurrentUser)

router.route('/logout')
    .post(controller.logout)

module.exports = router;
