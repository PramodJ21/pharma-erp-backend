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
      const products = await Product.find()
      async function calculateBalances(products) {
        const allProducts = []
        for (const product of products) {
          const { productName } = product;
          const isFP = product.category == "Finished Product"
          // Initialize the balances for each product
          currentProduct = {
            productName,
            openingBalance: 0,
            closingBalance: 0,
            purchased: 0,
            sold: 0,
          }
      
          // Fetch inventory items for each product
          const inventoryItems = await Inventory.find({ productName });
      
          // Process each inventory item
          inventoryItems.forEach((item) => {
            if(item.date >= start && item.date <= end){
              // Update purchased and sold quantities
             
                if(isFP !== true) currentProduct.purchased += 1;
              
               if (item.status === 'Sold' && item.updatedDate <= end) {
                currentProduct.sold += 1;

              }
            }
            // Update opening balance based on conditions
            if (item.date < start && item.status === "In Stock") {
              currentProduct.openingBalance += 1;
            } else if (item.status !== "In Stock" && item.updatedDate >= start && item.date < start) {
              currentProduct.openingBalance += 1;
            }

            //Update closing balance
            if (item.date <= end && item.status === "In Stock") {
              currentProduct.closingBalance += 1;
            } else if (item.status !== "In Stock" && item.updatedDate > end) {
              currentProduct.closingBalance += 1;
            }
          });
          allProducts.push(currentProduct)
        }

      res.json(allProducts)
      }
      calculateBalances(products)


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
const updateInventoryOnManufacturing= async (productName, quantity, batchId) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date
    
    const product = await Product.findOne({productName})
    console.log(productName)
    const productCode = product.productCode
    const productId = product.productId
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
            batchId,
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
          Inventory.findByIdAndUpdate(item._id, { status: 'Sold', updatedDate: new Date().toISOString() }, { new: true })
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
    updateInventoryOnSale,
    updateInventoryOnManufacturing
};
