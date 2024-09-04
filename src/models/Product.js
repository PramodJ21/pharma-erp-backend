const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId : {type:String, required: true},
    productCode: {type:String,  default:null},
    productName: { type: String, required: true },
    category: { type: String, enum: ['Raw Material', 'Trading Product', 'Finished Product'], required: true }, // New field
    purchasePrice: { type: Number,  default:null},
    salesPrice: { type: Number,  default:null},
    supplier: { type: String,  default:null}, // Optional: for Trading Products
});

module.exports = mongoose.model('Product', productSchema);
