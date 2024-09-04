const mongoose = require('mongoose');

// Define the ingredient schema
const ingredientSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0, // Quantity should not be negative
  },
});

// Define the output schema
const outputSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0, // Quantity should not be negative
  },
});

// Define the recipe schema
const recipeSchema = new mongoose.Schema({
  ingredients: {
    type: [ingredientSchema], // Array of ingredients
    required: true,
    validate: [arrayLimit, '{PATH} must have at least one ingredient.'],
  },
  output: {
    type: outputSchema, // Output object
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the date of creation
  },
});

// Custom validation function to ensure at least one ingredient is present
function arrayLimit(val) {
  return val.length > 0;
}

// Create the Recipe model
const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
