const spaCreateController = require('../controllers/spa.controller');
const express = require('express');
const router = express.Router();

router.get('/', spaCreateController.getAllServices);
router.post('/', spaCreateController.createService);
router.delete('/', spaCreateController.deleteService);

module.exports = router;