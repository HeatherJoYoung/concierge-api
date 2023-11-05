const registrationController = require('../controllers/registration.controller')
const express = require('express')
const router = express.Router()

router.post('/guest', registrationController.registerGuest)
router.post('/employee', registrationController.registerEmployee)

module.exports = router