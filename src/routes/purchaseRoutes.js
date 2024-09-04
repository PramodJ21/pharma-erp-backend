const express = require('express');
const router = express.Router();
const { createPurchase, getPurchases, getPurchaseById, updatePurchase, deletePurchase } = require('../controllers/purchaseController');

// Define the routes for purchases
router.post('/', createPurchase); // Record a new purchase
router.post('/get', getPurchases); // Get all purchases
router.get('/:id', getPurchaseById); // Get a purchase by ID
router.put('/:id', updatePurchase); // Update a purchase by ID
router.delete('/:id', deletePurchase); // Delete a purchase by ID

module.exports = router;
