const reservationController = require('../controllers/reservation.controller')
const express = require('express')
const router = express.Router();

router.post('/:table', reservationController.createReservation);
router.get('/:table', reservationController.getReservation)

module.exports = router;