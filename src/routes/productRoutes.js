const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductByCategory } = require('../controllers/productController');

// Define the routes for products
router.post('/', createProduct); // Create a new product
router.get('/', getProducts); // Get all products
router.get('/:id', getProductById); // Get a product by ID
router.post('/category', getProductByCategory); // Get a product by category
router.put('/:id', updateProduct); // Update a product by ID
router.delete('/:id', deleteProduct); // Delete a product by ID

module.exports = router;
