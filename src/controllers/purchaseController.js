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
      const { startDate, endDate, productId } = req.body;
  
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ message: 'Invalid start or end date' });
      }
  
      // Fetch the productName associated with the provided productId
      let productNameFilter = {};
  
      if (productId && productId !== 'all') {
        const product = await Product.findOne({ productId }); // Assuming you have a productId field in your Product schema
  
        if (product) {
          productNameFilter.productName = product.productName; // Use productName to filter purchases
        } else {
          return res.status(404).json({ message: 'Product not found' });
        }
      }
  
      // Construct query based on date range and optional productName filter
      const query = {
        purchaseDate: {
          $gte: start,
          $lte: end,
        },
        ...productNameFilter, // Include productName in query if provided
      };
  
      // Fetch purchases matching the query
      const purchases = await Purchase.find(query);
      const purchaseChartData = {};
    for (const item of purchases) {
      const purchaseDate = new Date(item.purchaseDate).toISOString().split('T')[0]; // Get the date part only

      // Initialize the entry for this date if it doesn't exist
      if (!purchaseChartData[purchaseDate]) {
        purchaseChartData[purchaseDate] = 0;
      }

      // Accumulate the quantity
      purchaseChartData[purchaseDate] += item.quantity;
    }

    // Convert aggregated data to an array format suitable for charting or further processing
    const aggregatedPurchaseData = Object.entries(purchaseChartData).map(([date, quantity]) => ({
      date,
      quantity,
    }));
      const purchaseData = await Promise.all(
        purchases.map(async (item) => {
          const product = await Product.findOne({ productName: item.productName });
  
          return {
            purchaseTransactionId: item.purchaseTransactionId,
            productName: product ? product.productName : 'Unknown',
            quantity: item.quantity,
            purchasePrice: product ? product.purchasePrice : 0,
            totalAmount: item.totalAmount,
            supplier: item.supplier,
            purchaseDate: item.purchaseDate,
          };
        })
      );
  
      res.status(200).json({purchaseData, aggregatedPurchaseData});
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
