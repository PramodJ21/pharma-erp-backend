const Recipe = require('../models/Recipe'); // Assuming there's a Recipe model
const Product = require('../models/Product'); // Assuming there's a Product model

const createRecipe = async (req, res) => {
  try {
    // Extract productName, ingredients, and output from the request body
    const {ingredients, output } = req.body;

    // Validate the provided data
    if (!ingredients || ingredients.length === 0 || !output) {
      return res.status(400).json({ message: 'Invalid input. Please provide ingredients, and output.' });
    }
    
    // Verify if the output product exists in the database
    const outputProduct = await Product.findOne({ productName: output.productName });
    if (!outputProduct) {
      return res.status(404).json({ message: `Output product ${output.productName} does not exist.` });
    }

    // Validate each ingredient
    for (const ingredient of ingredients) {
      if (!ingredient.productName || !ingredient.quantity) {
        return res.status(400).json({ message: 'Each ingredient must have a productName and quantity.' });
      }

      // Verify if the ingredient product exists in the database
      const ingredientProduct = await Product.findOne({ productName: ingredient.productName });
      if (!ingredientProduct) {
        return res.status(404).json({ message: `Ingredient product ${ingredient.productName} does not exist.` });
      }
    }

    // Create a new recipe
    const newRecipe = new Recipe({
      ingredients,
      output
    });

    // Save the new recipe to the database
    await newRecipe.save();

    res.status(201).json({ message: 'Recipe created successfully', recipe: newRecipe });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'An error occurred while creating the recipe' });
  }
};

const getAllRecipes = async (req, res) => {
    try {
        // Fetch all recipes from the database
        const recipes = await Recipe.find();

        // If no recipes are found, return a message indicating this
        if (!recipes || recipes.length === 0) {
            return res.status(404).json({ message: 'No recipes found' });
        }

        // Send the recipes in the response
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: 'An error occurred while fetching recipes' });
    }
};
module.exports = {
  createRecipe,
getAllRecipes

};
