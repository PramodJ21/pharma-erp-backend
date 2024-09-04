const express = require('express');
const router = express.Router();
const { getCustomer } = require('../controllers/customerController');

// Route to create a new customer

// Route to get a customer by phone number
router.get('/:customerPhone', getCustomer);

module.exports = router;
