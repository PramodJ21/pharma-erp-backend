const express = require('express');
const router = express.Router();
const { getInventory, updateInventory } = require('../controllers/inventoryController');

// Define the routes for inventory
router.get('/', getInventory); // Get inventory data

module.exports = router;
