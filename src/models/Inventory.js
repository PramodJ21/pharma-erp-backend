const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  inventoryId: { type: String, required: true },
  index: { type: Number, required: true },
  purchaseTransactionId: { type: String},
  batchId: { type: String},
  productId: { type: String, required: true },
  date: { type: Date, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['In Stock', 'In Manufacturing'], required: true },
});

// Index to ensure that each combination of productId and inventoryId is unique
inventorySchema.index({ inventoryId: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
