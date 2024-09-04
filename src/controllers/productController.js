const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product'); // Adjust path as necessary

const createProduct = async (req, res) => {
    const { productCode, productName, category, purchasePrice, salesPrice, supplier } = req.body;

    try {
        // Check if a product with the same name already exists
        const existingProduct = await Product.findOne({ productName });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product with the same name already exists' });
        }
        const productId = uuidv4()
        // Create a product object with required fields
        const productData = {
            productId,
            productCode,
            productName,
            category,
        };

        // Conditionally add optional fields based on category and request body
        if (purchasePrice !== undefined) {
            productData.purchasePrice = purchasePrice;
        }

        if (salesPrice !== undefined) {
            productData.salesPrice = salesPrice;
        }

        if (supplier !== undefined) {
            productData.supplier = supplier;
        }

        // Create a new product instance
        const newProduct = new Product(productData);

        // Save the product to the database
        await newProduct.save();

        res.status(201).json({ message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductByCategory = async (req, res) => {
    try {
        const {category} = req.params; // Extract category from the request body

        // Use the correct query format to find products by category
        const products = await Product.find({ category: category });

        // Check if no products were found
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found for this category' });
        }

        // Send the found products in the response
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update a product by ID
const updateProduct = async (req, res) => {
    try {
        const product = await Product.deleteOne({productId:req.params.id});
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
    try {
      // Extract productId from the request parameters
      const productId = req.params.id;
  
      // Delete the product based on the productId
      const result = await Product.deleteOne({ productId });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'An error occurred while deleting the product' });
    }
  };
  

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductByCategory
};
