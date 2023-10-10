const eventsController = require('../controllers/events.controller');
const express = require('express');
const router = express.Router();

router.get('/all', eventsController.getAllEvents);
router.post('/', eventsController.createEvent);
router.delete('/', eventsController.deleteEvent);

module.exports = router;