const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.route('/registration')
    .post(controller.createUser)

router.route('/login')
    .post(controller.getUserByEmail)

module.exports = router;
