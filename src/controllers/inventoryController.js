const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const product = require('../models/Product')
// Get inventory data
const getInventory = async (req, res) => {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
  
    try {
      // Parse the date strings to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Adjust end date to include the full day
      end.setHours(23, 59, 59, 999);
      console.log(end)
  
      // Log the dates to verify
      console.log('Start Date:', start);
      console.log('End Date:', end);
  
      // Find inventory items within the date range
      const inventoryItems = await Inventory.find({
        date: { $gte: start, $lte: end }
      });
  
      // Log the results to verify
    //   console.log('Inventory Items:', inventoryItems);
  
      // Aggregate inventory items by productId to calculate totals
      const inventorySummary = inventoryItems.reduce((acc, item) => {
        const { productId, productName, status } = item;
  
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            productName,
            totalPurchased: 0,
            totalSold: 0,
            openingBalance: 0,
            closingBalance: 0
          };
        }
  
        // Update totals based on status
        
          acc[productId].totalPurchased += 1; // Increment purchased quantity
        if (status === 'Sold') {
          acc[productId].totalSold += 1; // Increment sold quantity
        }
  
        return acc;
      }, {});
  
      // Fetch opening balances by looking at the inventory before the start date
      const openingBalances = await Inventory.find({
        date: { $lt: start },
        status: 'In Stock'
      });
  
      openingBalances.forEach(item => {
        const { productId } = item;
        if (inventorySummary[productId]) {
          inventorySummary[productId].openingBalance += 1;
        }
      });
  
      // Calculate closing balances
      Object.keys(inventorySummary).forEach(productId => {
        const { totalPurchased, totalSold, openingBalance } = inventorySummary[productId];
        inventorySummary[productId].closingBalance = openingBalance + totalPurchased - totalSold;
      });
  
      // Convert the summary object to an array
      const inventorySummaryArray = Object.values(inventorySummary);
  
      res.json(inventorySummaryArray);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      res.status(500).json({ message: 'Error fetching inventory data' });
    }
};

// Update inventory data by product ID
const updateInventoryOnPurchase = async (productId, productName, quantity, purchaseTransactionId) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date
    
    const product = await Product.findOne({productId})
    const productCode = product.productCode
    // Fetch existing records to determine the last index used
    const existingRecords = await Inventory.find({ productId }).sort({ index: -1 });
    const lastRecord = existingRecords[0];
    const lastIndex = lastRecord? lastRecord.index : 0; // Get the last index or default to 0
    console.log(lastRecord)
    // Create multiple inventory records
    const inventoryRecords = [];
    for (let i = 1; i <= quantity; i++) {
        const newIndex = lastIndex + i; // Generate a unique index for each item
        const inventoryId = `${productCode}-${newIndex}`;

        inventoryRecords.push({
            inventoryId,
            productId,
            index: newIndex,
            purchaseTransactionId,
            date: today,
            productName,
            quantity: 1, // Each record represents a single item
            status: 'In Stock',
            index: newIndex // Assign a unique index
        });
    }

    // Insert all new inventory records in a single operation
    await Inventory.insertMany(inventoryRecords);
};


const updateInventoryOnSale = async (productId, productName, quantity) => {
    try {
        // Fetch the inventory records for the product with status 'In Stock' and sort by date
        const inventoryItems = await Inventory.find({
            productId,
            status: 'In Stock'
        }).sort({ date: 1 }).limit(quantity); // Limit to the quantity needed

        if (inventoryItems.length < quantity) {
            throw new Error('Not enough inventory items available.');
        }

        // Update the status of the fetched inventory items to 'Sold'
        const updatePromises = inventoryItems.map(item =>
            Inventory.findByIdAndUpdate(item._id, { status: 'Sold' }, { new: true })
        );

        await Promise.all(updatePromises);

        console.log(`Updated ${quantity} inventory items for product ${productId} to 'Sold'.`);
    } catch (error) {
        console.error('Error updating inventory on sale:', error);
        throw error;
    }
};



module.exports = {
    getInventory,
    updateInventoryOnPurchase,
    updateInventoryOnSale
};
