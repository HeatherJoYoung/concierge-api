const eventsController = require('../controllers/events.controller');
const express = require('express');
const router = express.Router();

router.get('/all', eventsController.getAllEvents);

module.exports = router;