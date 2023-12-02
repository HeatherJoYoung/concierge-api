const reservationController = require('../controllers/reservation.controller')
const express = require('express')
const router = express.Router();

router.post('/:table', reservationController.createReservation);
router.get('/:table', reservationController.getReservations);
router.delete('/:table', reservationController.deleteReservation);
router.put('/:table', reservationController.updateReservation);

module.exports = router;