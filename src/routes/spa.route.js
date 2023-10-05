const userController = require('../controllers/spa.controller');
const express = require('express');
const router = express.Router();

router.get('/all', userController.getAllServices);
module.exports = router;