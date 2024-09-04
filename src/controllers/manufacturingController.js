const Recipe = require('../models/Recipe');
const Inventory = require('../models/Inventory');

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

module.exports = {
  checkManufacturingPossibility,
};
