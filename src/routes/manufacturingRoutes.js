const express = require('express');
const router = express.Router();
const { checkManufacturingPossibility } = require('../controllers/manufacturingController');

router.post('/check', checkManufacturingPossibility); // Endpoint for checking manufacturing possibility

module.exports = router;
