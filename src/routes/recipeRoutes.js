const express = require('express');
const router = express.Router();
const { createRecipe,getAllRecipes } = require('../controllers/recipeController'); // Assuming createRecipe is defined in recipeController.js

// Route to create a new recipe
router.post('/', createRecipe);
router.get('/', getAllRecipes);

module.exports = router;
