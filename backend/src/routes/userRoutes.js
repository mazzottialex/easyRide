const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');

router.route('/register')
    .post(controller.createUser)

router.route('/login')
    .post(controller.getUserByEmail)

router.route('/verify')
    .post(controller.verifyUser)

module.exports = router;
