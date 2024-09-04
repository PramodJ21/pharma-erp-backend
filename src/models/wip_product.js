const mongoose = require('mongoose');

const wipProductSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now, // Automatically set the current date
    required: true
  },
  batchId: {
    type: String,
    required: true,
  },
  inventoryId: {
    type: String,
    required: true
  },
    productId: {
        type: String,
        required: true
    },
  quantity: {
    type: Number,
    required: true,
    min: 0 // Quantity should not be negative
  },
  status: {
    type: String,
    enum: ['Work in progress'], // Only one status option
    default: 'Work in progress'
  }
});

// Create the WIP_Products model
const WIP_Product = mongoose.model('WIP_Product', wipProductSchema);

module.exports = WIP_Product;
