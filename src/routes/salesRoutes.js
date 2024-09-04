const express = require('express');
const router = express.Router();
const { createSalesTransaction, getSales, getSaleById, updateSale, deleteSale, getSalesTransactions } = require('../controllers/salesController');

// Define the routes for sales
router.post('/', createSalesTransaction); // Record a new sale
router.post('/get', getSalesTransactions); // Get all sales
router.get('/:id', getSaleById); // Get a sale by ID
router.put('/:id', updateSale); // Update a sale by ID
router.delete('/:id', deleteSale); // Delete a sale by ID

module.exports = router;
