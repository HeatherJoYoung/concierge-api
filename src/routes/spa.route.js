const spaCreateController = require('../controllers/spa.controller');
const express = require('express');
const router = express.Router();

router.get('/services', spaCreateController.getAllServices);
router.post('/services', spaCreateController.createService);
router.delete('/services', spaCreateController.deleteService);

router.get('/therapists', spaCreateController.getAllTherapists);
router.post('/therapists', spaCreateController.createTherapist);
router.delete('/therapists', spaCreateController.deleteTherapist);

module.exports = router;