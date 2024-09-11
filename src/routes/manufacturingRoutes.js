const express = require('express');
const router = express.Router();
const { checkManufacturingPossibility, startManufacturing, getManufacturingDetails, updateManufacturingStatus, getCompletedManufacturingDetails,getManufacturingChart } = require('../controllers/manufacturingController');

router.post('/check', checkManufacturingPossibility); // Endpoint for checking manufacturing possibility
router.get('/', getManufacturingDetails); // Endpoint for checking manufacturing possibility
router.get('/completed/:productName', getCompletedManufacturingDetails); // Endpoint for checking manufacturing possibility
router.post('/start', startManufacturing); // Endpoint for checking manufacturing possibility
router.put('/batch/:batchId', updateManufacturingStatus); // Endpoint for checking manufacturing possibility
router.post('/chart', getManufacturingChart)
module.exports = router;
