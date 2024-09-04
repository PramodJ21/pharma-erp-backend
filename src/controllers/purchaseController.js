const Purchase = require('../models/Purchase');
const Product = require('../models/Product')
const PurchasedProduct = require('../models/PurchasedProduct')
const {updateInventoryOnPurchase} = require('../controllers/inventoryController')
const { v4: uuidv4 } = require('uuid');
// Record a new purchase
const createPurchase = async (req, res) => {
    const { productId, supplier, quantity } = req.body;
    
    try {
        const purchaseDate = new Date().toISOString().split("T")[0]
        // Fetch product details using the product name
        const productDetails = await Product.findOne({ productId });
        if (!productDetails) {
            return res.status(400).json({ message: `Product with id "${productId}" not found` });
        }

        const { productName,productCode, purchasePrice } = productDetails;

        // Create a unique purchase transaction ID
        const purchaseTransactionId = uuidv4();

        // Store the purchase transaction
        const totalAmount = purchasePrice * quantity;
        const purchaseTransaction = new Purchase({
            purchaseTransactionId,
            supplier,
            productId,
            productName,
            quantity,
            totalAmount,
            purchaseDate
        });

        await purchaseTransaction.save();
        await updateInventoryOnPurchase(productId,productName,quantity,purchaseDate);
        // Calculate the total amount for all items
        
        const purchasedProducts = []
        // Generate entries for each purchased item
        for (let i = 0; i < quantity; i++) {
            // Generate a unique productId for each purchased product
            const uniqueProductId = uuidv4();
            const barcodeNo = `${productCode}/${uuidv4()}`;
            purchasedProducts.push({
                purchaseTransactionId,
                uniqueProductId,
                barcodeNo,
                productName,
                purchaseDate,
                supplier
            })
            // Store each purchased product entry
            await PurchasedProduct.create({
                purchaseTransactionId,
                uniqueProductId, // Unique productId for each item
                barcodeNo,
                productName,
                purchaseDate,
                supplier
            });
        }

        res.status(201).json({ message: 'Purchase order logged successfully', purchasedProducts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all purchases
const getPurchases = async (req, res) => {
    try {
      // Extract the start and end dates from the request body
      const { startDate, endDate } = req.body;
  
      // Validate the provided dates
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ message: 'Invalid start or end date' });
      }
  
      // Fetch all purchases within the date range
      const purchases = await Purchase.find({
        purchaseDate: {
          $gte: start,
          $lte: end,
        },
      });
  
      // Use Promise.all to handle asynchronous operations for each purchase
      const purchaseData = await Promise.all(
        purchases.map(async (item) => {
          // Fetch the product details for each purchased product
          const product = await Product.findOne({ productName: item.productName });
  
          return {
            purchaseTransactionId: item.purchaseTransactionId,
            productName: product ? product.productName : 'Unknown', // Handle cases where the product is not found
            quantity: item.quantity,
            purchasePrice: product ? product.purchasePrice : 0, // Handle cases where the product is not found
            totalAmount: item.totalAmount,
            supplier: item.supplier,
            purchaseDate: item.purchaseDate,
          };
        })
      );
  
      // Send the response with the aggregated purchase data
      res.status(200).json(purchaseData);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      res.status(500).json({ message: 'An error occurred while fetching purchases' });
    }
  };
  

// Get a purchase by ID
const getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json(purchase);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a purchase by ID
const updatePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json(purchase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a purchase by ID
const deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPurchase,
    getPurchases,
    getPurchaseById,
    updatePurchase,
    deletePurchase
};
