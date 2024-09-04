const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const product = require('../models/Product')
// Get inventory data
const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update inventory data by product ID
const updateInventoryOnPurchase = async (productId, productName, quantity, purchaseTransactionId) => {
    const today = new Date(); // Get today's date
    
    const product = await Product.findOne({productId})
    const productCode = product.productCode
    // Fetch existing records to determine the last index used
    const existingRecords = await Inventory.find({ productId }).sort({ inventoryId: -1 });
    const lastRecord = existingRecords[0];
    const lastIndex = lastRecord? parseInt(lastRecord.inventoryId.split('-')[2], 10) : 0; // Get the last index or default to 0
    console.log(lastRecord)
    // Create multiple inventory records
    const inventoryRecords = [];
    for (let i = 1; i <= quantity; i++) {
        const newIndex = lastIndex + i; // Generate a unique index for each item
        const inventoryId = `${productCode}-${newIndex}`;

        inventoryRecords.push({
            inventoryId,
            productId,
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


const updateInventoryOnSale = async (productId,productName, quantity, salesDate) => {

    // Find today's inventory record or create one
    let inventoryRecord = await Inventory.findOne({ productId, date: salesDate });

    if (!inventoryRecord) {
        // Find the previous day's closing balance
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        const prevInventoryRecord = await Inventory.findOne({ productId, date: yesterday.toISOString().split('T')[0] });

        const openingBalance = prevInventoryRecord.closingBalance;

        // Create a new record for today
        inventoryRecord = new Inventory({
            productId,
            productName,
            date: salesDate,
            openingBalance,
            purchasedQuantity: 0,
            soldQuantity: parseInt(quantity),
            closingBalance: openingBalance - parseInt(quantity)
        });
    } else {
        // Update existing record
        inventoryRecord.soldQuantity += parseInt(quantity);
        inventoryRecord.closingBalance = inventoryRecord.openingBalance + inventoryRecord.purchasedQuantity - inventoryRecord.soldQuantity;
    }

    await inventoryRecord.save();
};


module.exports = {
    getInventory,
    updateInventoryOnPurchase,
    updateInventoryOnSale
};
