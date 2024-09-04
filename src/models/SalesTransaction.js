const mongoose = require('mongoose');

const salesTransactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true },
            totalAmount: { type: Number, required: true }
        }
    ],
    fullTotalAmount: { type: Number, required: true },
    salesDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SalesTransaction', salesTransactionSchema);
