const diningCapacityController = require('../controllers/dining_capacity.controller');
const express = require('express');
const router = express.Router();

router.get('/all', diningCapacityController.getAllDiningCapacity);

module.exports = router;