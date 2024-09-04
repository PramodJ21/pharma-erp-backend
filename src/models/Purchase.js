const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    purchaseTransactionId: { type: String, required: true },
    supplier: { type: String, required: true },
    productName:{type:String,required:true},
    quantity: {type:Number, required:true},
    totalAmount: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
