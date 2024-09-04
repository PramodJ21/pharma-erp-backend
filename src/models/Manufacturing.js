const mongoose = require('mongoose');

const manufacturingSchema = new mongoose.Schema({
  manufacturingDate: {
    type: Date,
    default: Date.now
  },
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  FGQuantity: {
    type: Number,
    required: true
  },
  RMQuantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Work in Progress', 'Completed'],
    default: 'Work in Progress'
  },
  manufacturingEndDate : {
    type: Date
  }
});

const Manufacturing = mongoose.model('Manufacturing', manufacturingSchema);

module.exports = Manufacturing;
