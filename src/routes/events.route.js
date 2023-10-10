const eventController = require('../controllers/events.controller');
const express = require('express');
const router = express.Router();

router.post('/', eventController.createEvent);
router.delete('/', eventController.deleteEvent);

module.exports = router;