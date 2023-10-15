const diningController = require('../controllers/dining.controller');
const express = require('express');
const router = express.Router();

router.get('/capacity/all', diningController.getAllDiningCapacity);

module.exports = router;