const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');

router.route('/register')
    .post(controller.createUser)

router.route('/register-driver')
    .post(controller.createDriver)

router.route('/verify')
    .post(controller.verifyUser)

module.exports = router;
