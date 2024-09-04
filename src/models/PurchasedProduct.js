const mongoose = require('mongoose');

const purchasedProductSchema = new mongoose.Schema({
    purchaseTransactionId: { 
        type: String, 
        required: true 
    },
    uniqueProductId: { 
        type: String, 
        required: true 
    }, // Unique ID for each purchased product
    barcodeNo: { 
        type: String, 
        required: true,
        unique: true 
    }, // Format: productCode/uniqueid
    productName: { 
        type: String, 
        required: true 
    },
    purchaseDate: { 
        type: Date, 
        required: true 
    },
    supplier: { 
        type: String, 
        required: true 
    }
});

module.exports = mongoose.model('PurchasedProduct', purchasedProductSchema);
