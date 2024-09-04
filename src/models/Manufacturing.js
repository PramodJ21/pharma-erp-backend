const mongoose = require('mongoose');

const ManufacturingSchema = new mongoose.Schema({
    manufacturingId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null }
});

module.exports = mongoose.model('Manufacturing', ManufacturingSchema);
