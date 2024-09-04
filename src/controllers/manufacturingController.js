const Recipe = require('../models/Recipe');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product')
const { v4: uuidv4 } = require('uuid');
const WIP_Product = require('../models/wip_product')
const Manufacturing = require('../models/Manufacturing');
const checkManufacturingPossibility = async (req, res) => {
  try {
    const { productName, quantity } = req.body;

    // Fetch the recipe for the given product
    const recipe = await Recipe.findOne({ 'output.productName': productName });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found for the product' });
    }

    // Check each ingredient's availability
    const ingredients = recipe.ingredients;
    let canManufacture = true;
    let missingIngredients = [];

    for (let ingredient of ingredients) {
      const inventoryRecords = await Inventory.find({
        productName: ingredient.productName,
        status: 'In Stock',
      });

      // Calculate the total available quantity of the ingredient
      const totalAvailable = inventoryRecords.reduce((sum, record) => sum + record.quantity, 0);
      
      // Calculate the required quantity for the desired manufacturing
      const requiredQuantity = ingredient.quantity * quantity;

      // Check if there's enough of the ingredient
      if (totalAvailable < requiredQuantity) {
        canManufacture = false;
        missingIngredients.push({
          productName: ingredient.productName,
          requiredQuantity,
          availableQuantity: totalAvailable,
        });
      }
    }

    if (canManufacture) {
      res.status(200).json({ message: 'Sufficient ingredients' });
    } else {
      res.status(400).json({
        message: 'Insufficient ingredients.',
        missingIngredients,
      });
    }
  } catch (error) {
    console.error('Error checking manufacturing possibility:', error);
    res.status(500).json({ message: 'An error occurred while checking manufacturing possibility' });
  }
};
const startManufacturing = async (req, res) => {
    const { productName, quantity } = req.body;
    const batchId = uuidv4();
    try {
        // Fetch the recipe for the product
        const recipe = await Recipe.findOne({ 'output.productName': productName });

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Calculate the total quantity of each ingredient required
        const requiredIngredients = recipe.ingredients.map(ingredient => ({
            productName: ingredient.productName,
            requiredQuantity: ingredient.quantity * quantity
        }));

        const ingredientsToUpdate = [];
        const wipProductsToAdd = [];
        let totalRMQuantity = 0;

        // For each ingredient, fetch the required number of inventory items
        for (const ingredient of requiredIngredients) {
            let remainingQuantity = ingredient.requiredQuantity;
            const inventoryItems = await Inventory.find({
                productName: ingredient.productName,
                status: 'In Stock'
            }).sort({ date: 1 }); // Sort by date to use the oldest stock first

            for (const item of inventoryItems) {
                if (remainingQuantity <= 0) break;

                // Add to ingredientsToUpdate array
                ingredientsToUpdate.push({
                    inventoryId: item.inventoryId,
                    quantity: 1 // Each document represents 1 unit
                });

                // Add to WIP_Products array
                wipProductsToAdd.push({
                    batchId,
                    inventoryId: item.inventoryId,
                    productId: item.productId,
                    quantity: 1, // Assuming each inventory item represents 1 unit
                    date: item.date
                });

                remainingQuantity -= 1;
                totalRMQuantity += 1;
            }
        }

        // Generate a unique batch ID
        const manufacturingRecord = new Manufacturing({
            batchId,
            productId: recipe.output.productName, // Assuming productId is productName in this case
            productName,
            FGQuantity: quantity,
            RMQuantity: totalRMQuantity
        });

        await manufacturingRecord.save();

        //Update the inventory status to 'In Manufacturing'
        await Promise.all(
            ingredientsToUpdate.map(({ inventoryId }) =>
                Inventory.findOneAndUpdate(
                    { inventoryId },
                    { $set: { status: 'In Manufacturing' } }
                )
            )
        );

        // Add records to WIP_Products
        await WIP_Product.insertMany(wipProductsToAdd);

        // Send response with batch ID and ingredients used
        res.status(200).json({
            batchId,
            ingredientsUsed: ingredientsToUpdate
        });

    } catch (error) {
        console.error('Error starting manufacturing:', error);
        res.status(500).json({ message: 'An error occurred while starting manufacturing' });
    }
};
const getManufacturingDetails = async (req, res) => {
    try {

        
        const manufacturingRecords = await Manufacturing.find();
        res.status(200).json(manufacturingRecords);
    } catch (error) {
        console.error('Error fetching manufacturing details:', error);
        res.status(500).json({ message: 'An error occurred while fetching manufacturing details' });
    }
};

const updateManufacturingStatus = async (req, res) => {
    const { batchId } = req.params;
    const { status } = req.body;

    try {
        // Update the status of the manufacturing record
        const updatedManufacturing = await Manufacturing.findOneAndUpdate(
            { batchId },
            { $set: { status } },
            { new: true } // Return the updated document
        );

        if (!updatedManufacturing) {
            return res.status(404).json({ message: 'Manufacturing record not found' });
        }

        // Update the status of the WIP_Products records with the same batchId
        await WIP_Product.updateMany(
            { batchId },
            { $set: { status: 'Completed' } } // Change status to 'Completed'
        );

        res.status(200).json({
            message: 'Status updated successfully',
            updatedManufacturing
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'An error occurred while updating the status' });
    }
};

const getCompletedManufacturingDetails = async (req, res) => {
    const { productName } = req.params; // Get the product name from request parameters

    try {
        // Fetch all completed manufacturing records for the specified product
        const completedManufacturings = await Manufacturing.find({ 
            productName: productName, 
            status: 'Completed' 
        });

        // Initialize an array to store the results
        const manufacturingDetails = [];

        // Iterate through each completed manufacturing record
        for (const manufacturing of completedManufacturings) {
            const { batchId, FGQuantity } = manufacturing;

            // Fetch all WIP products related to this batch
            const wipProducts = await WIP_Product.find({ batchId });

            // Calculate the total cost of raw materials used
            let totalCost = 0;
            const ingredientQuantities = {};

            // Iterate through WIP products to sum up costs and quantities
            for (const wip of wipProducts) {
                // Fetch product record for purchase price details
                const product = await Product.findOne({ productId: wip.productId });
                
                // Assume each product has a `purchasePrice` field
                const costPerUnit = product ? product.purchasePrice : 0;
                const ingredientCost = costPerUnit * wip.quantity;

                // Add the cost to the total cost
                totalCost += ingredientCost;

                // Update ingredient quantity details
                if (ingredientQuantities[wip.productId]) {
                    ingredientQuantities[wip.productId].quantity += wip.quantity;
                    ingredientQuantities[wip.productId].cost += ingredientCost;
                } else {
                    ingredientQuantities[wip.productId] = {
                        productName: product.productName,
                        quantity: wip.quantity,
                        cost: ingredientCost
                    };
                }
            }
            console.log(ingredientQuantities)
            // Prepare the record to be sent to the frontend
            manufacturingDetails.push({
                batchId,
                ingredients: Object.values(ingredientQuantities), // Convert object to array
                manufacturedQuantity: FGQuantity,
                totalCost
            });
        }

        // Send the response
        res.status(200).json(manufacturingDetails);

    } catch (error) {
        console.error('Error fetching manufacturing details:', error);
        res.status(500).json({ message: 'An error occurred while fetching manufacturing details' });
    }
};



module.exports = {
  checkManufacturingPossibility,
  startManufacturing,
  getManufacturingDetails,
  updateManufacturingStatus,
  getCompletedManufacturingDetails
};
