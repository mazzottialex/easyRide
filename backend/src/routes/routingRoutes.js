const express = require('express')
const controller = require('../controllers/routingController')
const router = express.Router()

router.get('/route', controller.getRouteController)

module.exports = router
